import { and, desc, eq, gte, inArray, lte, SQL } from 'drizzle-orm';
import {
  AccountId,
  asAccountId,
  asCategoryId,
  asTagId,
  asTransactionId,
  CategoryId,
  CurrencyCode,
  Money,
  TagId,
  TransactionId,
} from '@/domain/shared';
import {
  SourceReference,
  Transaction,
  TransactionDirection,
  TransactionFilters,
  TransactionRepository,
  TransactionType,
} from '@/domain/transactions';
import { MontraDatabase } from '../client';
import * as schema from '../schema';

export class SQLiteTransactionRepository implements TransactionRepository {
  constructor(private db: MontraDatabase) {}

  async findById(id: TransactionId | string): Promise<Transaction | null> {
    const rows = await this.db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;

    const tagRows = await this.db
      .select({ tagId: schema.transactionTags.tagId })
      .from(schema.transactionTags)
      .where(eq(schema.transactionTags.transactionId, String(id)));

    const tagIds = tagRows.map((t) => asTagId(t.tagId));
    return this.mapToEntity(rows[0], tagIds);
  }

  async findMany(filters?: TransactionFilters): Promise<Transaction[]> {
    const conditions: SQL[] = [];

    if (filters?.accountId) {
      conditions.push(eq(schema.transactions.accountId, String(filters.accountId)));
    }
    if (filters?.categoryId) {
      conditions.push(eq(schema.transactions.categoryId, String(filters.categoryId)));
    }
    if (filters?.type) {
      conditions.push(eq(schema.transactions.type, filters.type));
    }
    if (filters?.startDate) {
      conditions.push(gte(schema.transactions.occurredAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(schema.transactions.occurredAt, filters.endDate));
    }

    let query = this.db
      .select()
      .from(schema.transactions)
      .orderBy(desc(schema.transactions.occurredAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    if (filters?.limit) {
      query = query.limit(filters.limit) as typeof query;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as typeof query;
    }

    const rows = await query;
    if (rows.length === 0) return [];

    const txIds = rows.map((r) => r.id);

    // Batch fetch tags
    const allTags = await this.db
      .select()
      .from(schema.transactionTags)
      .where(inArray(schema.transactionTags.transactionId, txIds));

    const tagsByTxId = new Map<string, TagId[]>();
    for (const tagRow of allTags) {
      const existing = tagsByTxId.get(tagRow.transactionId) ?? [];
      existing.push(asTagId(tagRow.tagId));
      tagsByTxId.set(tagRow.transactionId, existing);
    }

    let results = rows.map((r) => this.mapToEntity(r, tagsByTxId.get(r.id) ?? []));

    // In-memory filter for tags if specified in filters
    if (filters?.tagIds && filters.tagIds.length > 0) {
      const requiredTags = filters.tagIds.map(String);
      results = results.filter((tx) => tx.tagIds.some((t) => requiredTags.includes(String(t))));
    }

    return results;
  }

  async save(transaction: Transaction): Promise<void> {
    const row: schema.NewTransactionRow = {
      id: String(transaction.id),
      accountId: String(transaction.accountId),
      amountMinor: transaction.amount.amount,
      currency: transaction.amount.currency,
      direction: transaction.direction,
      type: transaction.type,
      occurredAt: transaction.occurredAt,
      description: transaction.description,
      categoryId: transaction.categoryId ? String(transaction.categoryId) : null,
      notes: transaction.notes,
      transferTargetAccountId: transaction.transferTargetAccountId
        ? String(transaction.transferTargetAccountId)
        : null,
      linkedTransactionId: transaction.linkedTransactionId
        ? String(transaction.linkedTransactionId)
        : null,
      sourceType: transaction.sourceReference?.sourceType ?? 'manual',
      sourceExternalId: transaction.sourceReference?.externalId ?? null,
      sourceRawNarration: transaction.sourceReference?.rawNarration ?? null,
      sourceImportedAt: transaction.sourceReference?.importedAt ?? null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    await this.db
      .insert(schema.transactions)
      .values(row)
      .onConflictDoUpdate({
        target: schema.transactions.id,
        set: {
          accountId: row.accountId,
          amountMinor: row.amountMinor,
          currency: row.currency,
          direction: row.direction,
          type: row.type,
          occurredAt: row.occurredAt,
          description: row.description,
          categoryId: row.categoryId,
          notes: row.notes,
          transferTargetAccountId: row.transferTargetAccountId,
          linkedTransactionId: row.linkedTransactionId,
          sourceType: row.sourceType,
          sourceExternalId: row.sourceExternalId,
          sourceRawNarration: row.sourceRawNarration,
          sourceImportedAt: row.sourceImportedAt,
          updatedAt: row.updatedAt,
        },
      });

    // Update tags junction
    await this.db
      .delete(schema.transactionTags)
      .where(eq(schema.transactionTags.transactionId, String(transaction.id)));

    if (transaction.tagIds.length > 0) {
      const tagInserts = transaction.tagIds.map((tagId) => ({
        transactionId: String(transaction.id),
        tagId: String(tagId),
      }));
      await this.db.insert(schema.transactionTags).values(tagInserts).onConflictDoNothing();
    }
  }

  async saveBatch(transactions: readonly Transaction[]): Promise<void> {
    for (const tx of transactions) {
      await this.save(tx);
    }
  }

  async delete(id: TransactionId | string): Promise<void> {
    await this.db.delete(schema.transactions).where(eq(schema.transactions.id, String(id)));
  }

  private mapToEntity(row: schema.TransactionRow, tagIds: readonly TagId[]): Transaction {
    const currency = (row.currency as CurrencyCode) ?? 'INR';
    const sourceReference: SourceReference | null = row.sourceType
      ? {
          sourceType: row.sourceType as 'manual' | 'csv_import' | 'bank_sync' | 'account_aggregator',
          externalId: row.sourceExternalId,
          rawNarration: row.sourceRawNarration,
          importedAt: row.sourceImportedAt ?? row.createdAt,
        }
      : null;

    return new Transaction({
      id: asTransactionId(row.id),
      accountId: asAccountId(row.accountId),
      amount: new Money({ amount: row.amountMinor, currency }),
      direction: row.direction as TransactionDirection,
      type: row.type as TransactionType,
      occurredAt: row.occurredAt,
      description: row.description,
      categoryId: row.categoryId ? asCategoryId(row.categoryId) : null,
      tagIds,
      notes: row.notes,
      sourceReference,
      transferTargetAccountId: row.transferTargetAccountId ? asAccountId(row.transferTargetAccountId) : null,
      linkedTransactionId: row.linkedTransactionId ? asTransactionId(row.linkedTransactionId) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

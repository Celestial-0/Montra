import { Clock } from '../shared/clock.port';
import { CurrencyCode } from '../shared/currency';
import { DomainError } from '../shared/errors';
import { AccountId, generateId, RecordId, TransactionId } from '../shared/ids';
import { Money } from '../shared/money';
import { Result } from '../shared/result';
import { Transaction } from '../transactions/transaction.entity';
import { assertValidTransaction } from '../transactions/transaction.invariants';
import { TransactionRepository } from '../transactions/transaction.repository';
import { FinancialRecord } from './financial-record.entity';
import { normalizeRawRow } from './import.normalizer';
import { FileImportParser } from './import.parser';

export interface ImportStatementInput {
  readonly accountId: AccountId | string;
  readonly fileContent: string;
  readonly fileType: 'csv' | 'json';
  readonly currency?: CurrencyCode;
}

export interface ImportSummary {
  readonly importedCount: number;
  readonly skippedDuplicateCount: number;
  readonly transactions: readonly Transaction[];
  readonly rawRecords: readonly FinancialRecord[];
}

export class ImportRecordsUseCase {
  constructor(
    private parser: FileImportParser,
    private transactionRepo: TransactionRepository,
    private clock: Clock
  ) {}

  async execute(input: ImportStatementInput): Promise<Result<ImportSummary, DomainError>> {
    try {
      const rows = await this.parser.parse(input.fileContent, input.fileType);
      const now = this.clock.nowISO();
      const currency: CurrencyCode = input.currency ?? 'INR';

      // Fetch existing transactions for deduplication
      const existingTransactions = await this.transactionRepo.findMany({ accountId: input.accountId });

      const transactionsToSave: Transaction[] = [];
      const rawRecords: FinancialRecord[] = [];
      let skippedCount = 0;

      for (const row of rows) {
        const normalized = normalizeRawRow(row);
        const recordId = generateId<RecordId>();

        // Check deduplication: same date, same amount, same direction, matching reference or description
        const isDuplicate = existingTransactions.some((existing) => {
          const matchDate = existing.occurredAt.slice(0, 10) === normalized.date.slice(0, 10);
          const matchAmount = existing.amount.amount === normalized.amountMinor;
          const matchDirection = existing.direction === normalized.direction;

          if (normalized.externalReference && existing.sourceReference?.externalId) {
            return matchDate && matchAmount && existing.sourceReference.externalId === normalized.externalReference;
          }

          const matchDescription = existing.description?.toLowerCase() === normalized.description.toLowerCase();
          return matchDate && matchAmount && matchDirection && matchDescription;
        });

        if (isDuplicate) {
          skippedCount++;
          rawRecords.push(
            new FinancialRecord({
              id: recordId,
              sourceId: String(input.accountId),
              sourceType: input.fileType === 'csv' ? 'csv_import' : 'json_import',
              rawPayload: JSON.stringify(row),
              parsedAt: now,
              isProcessed: false,
              error: 'Duplicate transaction skipped during import.',
              createdAt: now,
            })
          );
          continue;
        }

        const transactionId = generateId<TransactionId>();

        const transaction = new Transaction({
          id: transactionId,
          accountId: input.accountId,
          amount: new Money({ amount: normalized.amountMinor, currency }),
          direction: normalized.direction,
          type: normalized.direction === 'debit' ? 'expense' : 'income',
          occurredAt: normalized.date,
          description: normalized.description,
          sourceReference: {
            sourceType: input.fileType === 'csv' ? 'csv_import' : 'csv_import', // json treated as csv_import until bank_sync adapter exists
            externalId: normalized.externalReference,
            rawNarration: row.narration,
            importedAt: now,
          },
          createdAt: now,
          updatedAt: now,
        });

        assertValidTransaction(transaction);
        transactionsToSave.push(transaction);

        rawRecords.push(
          new FinancialRecord({
            id: recordId,
            sourceId: String(input.accountId),
            sourceType: input.fileType === 'csv' ? 'csv_import' : 'json_import',
            rawPayload: JSON.stringify(row),
            parsedAt: now,
            isProcessed: true,
            canonicalTransactionId: transactionId,
            createdAt: now,
          })
        );
      }

      if (transactionsToSave.length > 0) {
        await this.transactionRepo.saveBatch(transactionsToSave);
      }

      return Result.ok({
        importedCount: transactionsToSave.length,
        skippedDuplicateCount: skippedCount,
        transactions: transactionsToSave,
        rawRecords,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

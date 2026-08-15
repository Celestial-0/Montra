import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { accounts } from './accounts';
import { categories } from './categories';

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull().default('INR'),
  direction: text('direction').notNull(), // 'debit' | 'credit'
  type: text('type').notNull(), // 'expense' | 'income' | 'transfer' | 'refund' | 'adjustment' | 'unknown'
  occurredAt: text('occurred_at').notNull(), // ISO 8601
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  notes: text('notes'),
  transferTargetAccountId: text('transfer_target_account_id'),
  linkedTransactionId: text('linked_transaction_id'),
  sourceType: text('source_type'), // 'manual' | 'csv_import' | 'bank_sync' | 'account_aggregator'
  sourceExternalId: text('source_external_id'),
  sourceRawNarration: text('source_raw_narration'),
  sourceImportedAt: text('source_imported_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type TransactionRow = typeof transactions.$inferSelect;
export type NewTransactionRow = typeof transactions.$inferInsert;

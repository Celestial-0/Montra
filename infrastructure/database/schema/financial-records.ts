import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const financialRecords = sqliteTable('financial_records', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull(),
  sourceType: text('source_type').notNull(),
  rawPayload: text('raw_payload').notNull(),
  parsedAt: text('parsed_at').notNull(),
  isProcessed: integer('is_processed', { mode: 'boolean' }).notNull().default(false),
  canonicalTransactionId: text('canonical_transaction_id'),
  error: text('error'),
  createdAt: text('created_at').notNull(),
});

export type FinancialRecordRow = typeof financialRecords.$inferSelect;
export type NewFinancialRecordRow = typeof financialRecords.$inferInsert;

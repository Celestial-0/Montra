import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { tags } from './tags';
import { transactions } from './transactions';

export const transactionTags = sqliteTable(
  'transaction_tags',
  {
    transactionId: text('transaction_id')
      .notNull()
      .references(() => transactions.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.transactionId, t.tagId] })]
);

export type TransactionTagRow = typeof transactionTags.$inferSelect;
export type NewTransactionTagRow = typeof transactionTags.$inferInsert;

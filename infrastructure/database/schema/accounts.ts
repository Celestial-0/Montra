import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'bank' | 'cash' | 'credit_card' | 'wallet' | 'investment' | 'other'
  currency: text('currency').notNull().default('INR'),
  initialBalanceMinor: integer('initial_balance_minor').notNull().default(0),
  currentBalanceMinor: integer('current_balance_minor').notNull().default(0),
  institutionName: text('institution_name'),
  accountNumberMask: text('account_number_mask'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type AccountRow = typeof accounts.$inferSelect;
export type NewAccountRow = typeof accounts.$inferInsert;

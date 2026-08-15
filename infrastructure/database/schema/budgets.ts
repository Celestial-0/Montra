import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  targetAmountMinor: integer('target_amount_minor').notNull(),
  currency: text('currency').notNull().default('INR'),
  scopeType: text('scope_type').notNull(), // 'category' | 'tag' | 'account' | 'all' | 'custom'
  scopeTargetIdsJson: text('scope_target_ids_json').notNull().default('[]'), // JSON array of string IDs
  periodCadence: text('period_cadence').notNull(), // 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  periodStartDate: text('period_start_date').notNull(),
  periodEndDate: text('period_end_date'),
  periodTimezone: text('period_timezone').default('Asia/Kolkata'),
  rolloverEnabled: integer('rollover_enabled', { mode: 'boolean' }).notNull().default(false),
  rolloverAmountMinor: integer('rollover_amount_minor'),
  alertThresholdPercent: integer('alert_threshold_percent').default(80),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type BudgetRow = typeof budgets.$inferSelect;
export type NewBudgetRow = typeof budgets.$inferInsert;

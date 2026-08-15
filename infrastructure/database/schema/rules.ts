import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const rules = sqliteTable('rules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  conditionsJson: text('conditions_json').notNull().default('[]'), // JSON array of RuleCondition
  actionJson: text('action_json').notNull().default('{}'), // JSON object of RuleAction
  priority: integer('priority').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type RuleRow = typeof rules.$inferSelect;
export type NewRuleRow = typeof rules.$inferInsert;

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const views = sqliteTable('views', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  filtersJson: text('filters_json').notNull().default('{}'), // JSON serialized ViewFilter
  sortField: text('sort_field').notNull().default('occurredAt'), // 'occurredAt' | 'amount' | 'description'
  sortDirection: text('sort_direction').notNull().default('desc'), // 'asc' | 'desc'
  groupBy: text('group_by'), // 'category' | 'account' | 'month' | 'tag' | 'type'
  visualizationType: text('visualization_type').default('cards'), // 'table' | 'cards' | 'chart'
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type ViewRow = typeof views.$inferSelect;
export type NewViewRow = typeof views.$inferInsert;

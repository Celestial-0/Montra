import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: text('created_at').notNull(),
});

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;

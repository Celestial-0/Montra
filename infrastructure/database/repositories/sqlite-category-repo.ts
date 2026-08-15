import { eq } from 'drizzle-orm';
import { Category, CategoryRepository, Tag } from '@/domain/categories';
import { asCategoryId, asTagId, CategoryId, TagId } from '@/domain/shared';
import { MontraDatabase } from '../client';
import * as schema from '../schema';

export class SQLiteCategoryRepository implements CategoryRepository {
  constructor(private db: MontraDatabase) {}

  async findCategoryById(id: CategoryId | string): Promise<Category | null> {
    const rows = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapCategoryToEntity(rows[0]);
  }

  async findAllCategories(): Promise<Category[]> {
    const rows = await this.db.select().from(schema.categories);
    return rows.map((r) => this.mapCategoryToEntity(r));
  }

  async saveCategory(category: Category): Promise<void> {
    const row: schema.NewCategoryRow = {
      id: String(category.id),
      name: category.name,
      parentId: category.parentId ? String(category.parentId) : null,
      icon: category.icon,
      color: category.color,
      isSystem: category.isSystem,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    await this.db
      .insert(schema.categories)
      .values(row)
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: {
          name: row.name,
          parentId: row.parentId,
          icon: row.icon,
          color: row.color,
          isSystem: row.isSystem,
          updatedAt: row.updatedAt,
        },
      });
  }

  async deleteCategory(id: CategoryId | string): Promise<void> {
    await this.db.delete(schema.categories).where(eq(schema.categories.id, String(id)));
  }

  async findTagById(id: TagId | string): Promise<Tag | null> {
    const rows = await this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapTagToEntity(rows[0]);
  }

  async findAllTags(): Promise<Tag[]> {
    const rows = await this.db.select().from(schema.tags);
    return rows.map((r) => this.mapTagToEntity(r));
  }

  async saveTag(tag: Tag): Promise<void> {
    const row: schema.NewTagRow = {
      id: String(tag.id),
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt,
    };

    await this.db
      .insert(schema.tags)
      .values(row)
      .onConflictDoUpdate({
        target: schema.tags.id,
        set: {
          name: row.name,
          color: row.color,
        },
      });
  }

  async deleteTag(id: TagId | string): Promise<void> {
    await this.db.delete(schema.tags).where(eq(schema.tags.id, String(id)));
  }

  private mapCategoryToEntity(row: schema.CategoryRow): Category {
    return new Category({
      id: asCategoryId(row.id),
      name: row.name,
      parentId: row.parentId ? asCategoryId(row.parentId) : null,
      icon: row.icon,
      color: row.color,
      isSystem: row.isSystem,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private mapTagToEntity(row: schema.TagRow): Tag {
    return new Tag({
      id: asTagId(row.id),
      name: row.name,
      color: row.color,
      createdAt: row.createdAt,
    });
  }
}

import { eq } from 'drizzle-orm';
import { asViewId, ViewId } from '@/domain/shared';
import { View, ViewFilter, ViewGroupByField, ViewRepository, ViewSort, ViewSortField } from '@/domain/views';
import { MontraDatabase } from '../client';
import * as schema from '../schema';

export class SQLiteViewRepository implements ViewRepository {
  constructor(private db: MontraDatabase) {}

  async findById(id: ViewId | string): Promise<View | null> {
    const rows = await this.db
      .select()
      .from(schema.views)
      .where(eq(schema.views.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToEntity(rows[0]);
  }

  async findAll(): Promise<View[]> {
    const rows = await this.db.select().from(schema.views);
    return rows.map((r) => this.mapToEntity(r));
  }

  async save(view: View): Promise<void> {
    const row: schema.NewViewRow = {
      id: String(view.id),
      name: view.name,
      icon: view.icon,
      filtersJson: JSON.stringify(view.filters),
      sortField: view.sort.field,
      sortDirection: view.sort.direction,
      groupBy: view.groupBy,
      visualizationType: view.visualizationType,
      isPinned: view.isPinned,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    };

    await this.db
      .insert(schema.views)
      .values(row)
      .onConflictDoUpdate({
        target: schema.views.id,
        set: {
          name: row.name,
          icon: row.icon,
          filtersJson: row.filtersJson,
          sortField: row.sortField,
          sortDirection: row.sortDirection,
          groupBy: row.groupBy,
          visualizationType: row.visualizationType,
          isPinned: row.isPinned,
          updatedAt: row.updatedAt,
        },
      });
  }

  async delete(id: ViewId | string): Promise<void> {
    await this.db.delete(schema.views).where(eq(schema.views.id, String(id)));
  }

  private mapToEntity(row: schema.ViewRow): View {
    let filters: ViewFilter = {};
    try {
      filters = JSON.parse(row.filtersJson);
    } catch {
      filters = {};
    }

    const sort: ViewSort = {
      field: (row.sortField as ViewSortField) ?? 'occurredAt',
      direction: (row.sortDirection as 'asc' | 'desc') ?? 'desc',
    };

    return new View({
      id: asViewId(row.id),
      name: row.name,
      icon: row.icon,
      filters,
      sort,
      groupBy: row.groupBy as ViewGroupByField,
      visualizationType: (row.visualizationType as 'table' | 'cards' | 'chart') ?? 'cards',
      isPinned: row.isPinned,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

import { desc, eq } from 'drizzle-orm';
import { Rule, RuleAction, RuleCondition, RuleRepository } from '@/domain/rules';
import { asRuleId, RuleId } from '@/domain/shared';
import { MontraDatabase } from '../client';
import * as schema from '../schema';

export class SQLiteRuleRepository implements RuleRepository {
  constructor(private db: MontraDatabase) {}

  async findById(id: RuleId | string): Promise<Rule | null> {
    const rows = await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToEntity(rows[0]);
  }

  async findAll(): Promise<Rule[]> {
    const rows = await this.db
      .select()
      .from(schema.rules)
      .orderBy(desc(schema.rules.priority));

    return rows.map((r) => this.mapToEntity(r));
  }

  async findAllActive(): Promise<Rule[]> {
    const rows = await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.isActive, true))
      .orderBy(desc(schema.rules.priority));

    return rows.map((r) => this.mapToEntity(r));
  }

  async save(rule: Rule): Promise<void> {
    const row: schema.NewRuleRow = {
      id: String(rule.id),
      name: rule.name,
      conditionsJson: JSON.stringify(rule.conditions),
      actionJson: JSON.stringify(rule.action),
      priority: rule.priority,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };

    await this.db
      .insert(schema.rules)
      .values(row)
      .onConflictDoUpdate({
        target: schema.rules.id,
        set: {
          name: row.name,
          conditionsJson: row.conditionsJson,
          actionJson: row.actionJson,
          priority: row.priority,
          isActive: row.isActive,
          updatedAt: row.updatedAt,
        },
      });
  }

  async delete(id: RuleId | string): Promise<void> {
    await this.db.delete(schema.rules).where(eq(schema.rules.id, String(id)));
  }

  private mapToEntity(row: schema.RuleRow): Rule {
    let conditions: RuleCondition[] = [];
    let action: RuleAction = {};

    try {
      conditions = JSON.parse(row.conditionsJson);
    } catch {
      conditions = [];
    }

    try {
      action = JSON.parse(row.actionJson);
    } catch {
      action = {};
    }

    return new Rule({
      id: asRuleId(row.id),
      name: row.name,
      conditions,
      action,
      priority: row.priority,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

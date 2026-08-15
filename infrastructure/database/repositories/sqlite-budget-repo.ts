import { eq } from 'drizzle-orm';
import { Budget, BudgetPeriod, BudgetRepository, BudgetScope, BudgetScopeType, PeriodCadence } from '@/domain/budgets';
import { asBudgetId, BudgetId, CurrencyCode, Money } from '@/domain/shared';
import { MontraDatabase } from '../client';
import * as schema from '../schema';

export class SQLiteBudgetRepository implements BudgetRepository {
  constructor(private db: MontraDatabase) {}

  async findById(id: BudgetId | string): Promise<Budget | null> {
    const rows = await this.db
      .select()
      .from(schema.budgets)
      .where(eq(schema.budgets.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToEntity(rows[0]);
  }

  async findAllActive(): Promise<Budget[]> {
    const rows = await this.db
      .select()
      .from(schema.budgets)
      .where(eq(schema.budgets.isActive, true));

    return rows.map((r) => this.mapToEntity(r));
  }

  async save(budget: Budget): Promise<void> {
    const row: schema.NewBudgetRow = {
      id: String(budget.id),
      name: budget.name,
      targetAmountMinor: budget.targetAmount.amount,
      currency: budget.targetAmount.currency,
      scopeType: budget.scope.type,
      scopeTargetIdsJson: JSON.stringify(budget.scope.targetIds),
      periodCadence: budget.period.cadence,
      periodStartDate: budget.period.startDate,
      periodEndDate: budget.period.endDate,
      periodTimezone: budget.period.timezone,
      rolloverEnabled: budget.rolloverEnabled,
      rolloverAmountMinor: budget.rolloverAmount ? budget.rolloverAmount.amount : null,
      alertThresholdPercent: budget.alertThresholdPercent ?? 80,
      isActive: budget.isActive,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };

    await this.db
      .insert(schema.budgets)
      .values(row)
      .onConflictDoUpdate({
        target: schema.budgets.id,
        set: {
          name: row.name,
          targetAmountMinor: row.targetAmountMinor,
          currency: row.currency,
          scopeType: row.scopeType,
          scopeTargetIdsJson: row.scopeTargetIdsJson,
          periodCadence: row.periodCadence,
          periodStartDate: row.periodStartDate,
          periodEndDate: row.periodEndDate,
          periodTimezone: row.periodTimezone,
          rolloverEnabled: row.rolloverEnabled,
          rolloverAmountMinor: row.rolloverAmountMinor,
          alertThresholdPercent: row.alertThresholdPercent,
          isActive: row.isActive,
          updatedAt: row.updatedAt,
        },
      });
  }

  async delete(id: BudgetId | string): Promise<void> {
    await this.db.delete(schema.budgets).where(eq(schema.budgets.id, String(id)));
  }

  private mapToEntity(row: schema.BudgetRow): Budget {
    const currency = (row.currency as CurrencyCode) ?? 'INR';
    let targetIds: string[] = [];
    try {
      targetIds = JSON.parse(row.scopeTargetIdsJson);
    } catch {
      targetIds = [];
    }

    return new Budget({
      id: asBudgetId(row.id),
      name: row.name,
      targetAmount: new Money({ amount: row.targetAmountMinor, currency }),
      scope: new BudgetScope({ type: row.scopeType as BudgetScopeType, targetIds }),
      period: new BudgetPeriod({
        cadence: row.periodCadence as PeriodCadence,
        startDate: row.periodStartDate,
        endDate: row.periodEndDate,
        timezone: row.periodTimezone ?? 'Asia/Kolkata',
      }),
      rolloverEnabled: row.rolloverEnabled,
      rolloverAmount: row.rolloverAmountMinor !== null && row.rolloverAmountMinor !== undefined
        ? new Money({ amount: row.rolloverAmountMinor, currency })
        : null,
      alertThresholdPercent: row.alertThresholdPercent,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

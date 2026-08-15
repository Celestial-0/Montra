import { Clock } from '../shared/clock.port';
import { CurrencyCode } from '../shared/currency';
import { DomainError, NotFoundError } from '../shared/errors';
import { BudgetId, generateId } from '../shared/ids';
import { Money } from '../shared/money';
import { Result } from '../shared/result';
import { Budget } from './budget.entity';
import { assertValidBudget } from './budget.invariants';
import { BudgetPeriod, PeriodCadence } from './budget.period';
import { BudgetRepository } from './budget.repository';
import { BudgetScope, BudgetScopeType } from './budget.scope';

export interface CreateBudgetInput {
  readonly name: string;
  readonly targetAmountMinor: number;
  readonly scopeType: BudgetScopeType;
  readonly targetIds?: readonly string[];
  readonly cadence: PeriodCadence;
  readonly startDate: string;
  readonly endDate?: string | null;
  readonly rolloverEnabled?: boolean;
  readonly alertThresholdPercent?: number;
  readonly currency?: CurrencyCode;
}

export class CreateBudgetUseCase {
  constructor(
    private budgetRepo: BudgetRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateBudgetInput): Promise<Result<Budget, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const currency: CurrencyCode = input.currency ?? 'INR';
      const budget = new Budget({
        id: generateId<BudgetId>(),
        name: input.name,
        targetAmount: new Money({ amount: input.targetAmountMinor, currency }),
        scope: new BudgetScope({ type: input.scopeType, targetIds: input.targetIds ?? [] }),
        period: new BudgetPeriod({ cadence: input.cadence, startDate: input.startDate, endDate: input.endDate }),
        rolloverEnabled: input.rolloverEnabled ?? false,
        alertThresholdPercent: input.alertThresholdPercent ?? 80,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      assertValidBudget(budget);
      await this.budgetRepo.save(budget);
      return Result.ok(budget);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface UpdateBudgetInput {
  readonly id: BudgetId | string;
  readonly name?: string;
  readonly targetAmountMinor?: number;
  readonly alertThresholdPercent?: number;
  readonly rolloverEnabled?: boolean;
  readonly isActive?: boolean;
}

export class UpdateBudgetUseCase {
  constructor(
    private budgetRepo: BudgetRepository,
    private clock: Clock
  ) {}

  async execute(input: UpdateBudgetInput): Promise<Result<Budget, DomainError>> {
    try {
      const existing = await this.budgetRepo.findById(input.id);
      if (!existing) {
        return Result.err(new NotFoundError('Budget', input.id));
      }

      const updated = new Budget({
        id: existing.id,
        name: input.name ?? existing.name,
        targetAmount:
          input.targetAmountMinor !== undefined
            ? new Money({ amount: input.targetAmountMinor, currency: existing.targetAmount.currency })
            : existing.targetAmount,
        scope: existing.scope,
        period: existing.period,
        rolloverEnabled: input.rolloverEnabled ?? existing.rolloverEnabled,
        rolloverAmount: existing.rolloverAmount,
        alertThresholdPercent: input.alertThresholdPercent ?? existing.alertThresholdPercent,
        isActive: input.isActive ?? existing.isActive,
        createdAt: existing.createdAt,
        updatedAt: this.clock.nowISO(),
      });

      assertValidBudget(updated);
      await this.budgetRepo.save(updated);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteBudgetUseCase {
  constructor(private budgetRepo: BudgetRepository) {}

  async execute(id: BudgetId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.budgetRepo.findById(id);
      if (!existing) {
        return Result.err(new NotFoundError('Budget', id));
      }
      await this.budgetRepo.delete(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

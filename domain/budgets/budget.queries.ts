import { Clock } from '../shared/clock.port';
import { DomainError } from '../shared/errors';
import { Money } from '../shared/money';
import { Result } from '../shared/result';
import { SpendingQueryPort } from '../shared/spending-query.port';
import { Budget } from './budget.entity';
import { BudgetRepository } from './budget.repository';

export interface BudgetProgress {
  readonly budget: Budget;
  readonly spentAmount: Money;
  readonly remainingAmount: Money;
  readonly percentageUsed: number;
  readonly isExceeded: boolean;
  readonly isWarning: boolean;
}

export class GetBudgetProgressQuery {
  constructor(
    private budgetRepo: BudgetRepository,
    private spendingQuery: SpendingQueryPort,
    private clock: Clock
  ) {}

  async execute(): Promise<Result<BudgetProgress[], DomainError>> {
    try {
      const budgets = await this.budgetRepo.findAllActive();
      const now = this.clock.now();

      const progressList: BudgetProgress[] = [];

      for (const budget of budgets) {
        const periodRange = budget.period.currentRange(now);

        const scopeFilter = {
          categoryIds: budget.scope.type === 'category' ? budget.scope.targetIds : undefined,
          tagIds: budget.scope.type === 'tag' ? budget.scope.targetIds : undefined,
          accountIds: budget.scope.type === 'account' ? budget.scope.targetIds : undefined,
        };

        const totalSpentMinor = await this.spendingQuery.getSpendingByScope(
          scopeFilter,
          periodRange.startDate,
          periodRange.endDate
        );

        const spent = new Money({ amount: totalSpentMinor, currency: budget.targetAmount.currency });
        const remainingMinor = Math.max(0, budget.targetAmount.amount - totalSpentMinor);
        const remaining = new Money({ amount: remainingMinor, currency: budget.targetAmount.currency });
        const percentage = budget.targetAmount.amount > 0 ? (totalSpentMinor / budget.targetAmount.amount) * 100 : 0;

        progressList.push({
          budget,
          spentAmount: spent,
          remainingAmount: remaining,
          percentageUsed: Math.round(percentage),
          isExceeded: totalSpentMinor > budget.targetAmount.amount,
          isWarning: percentage >= (budget.alertThresholdPercent ?? 80),
        });
      }

      return Result.ok(progressList);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

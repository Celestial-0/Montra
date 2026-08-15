import { InvariantViolationError } from '../shared/errors';
import { Budget } from './budget.entity';

export function assertValidBudget(budget: Budget): void {
  if (!budget.name || !budget.name.trim()) {
    throw new InvariantViolationError('Budget name cannot be empty.');
  }

  if (budget.targetAmount.amount <= 0) {
    throw new InvariantViolationError('Budget target amount must be strictly greater than 0.');
  }

  if (budget.alertThresholdPercent !== null) {
    if (budget.alertThresholdPercent < 0 || budget.alertThresholdPercent > 100) {
      throw new InvariantViolationError('Budget alert threshold percentage must be between 0 and 100.');
    }
  }

  if (budget.scope.type === 'category' && budget.scope.targetIds.length === 0) {
    throw new InvariantViolationError('Category-scoped budget must specify at least one category ID.');
  }

  if (budget.scope.type === 'tag' && budget.scope.targetIds.length === 0) {
    throw new InvariantViolationError('Tag-scoped budget must specify at least one tag ID.');
  }

  if (budget.scope.type === 'account' && budget.scope.targetIds.length === 0) {
    throw new InvariantViolationError('Account-scoped budget must specify at least one account ID.');
  }

  if (budget.period.endDate && budget.period.startDate > budget.period.endDate) {
    throw new InvariantViolationError('Budget period start date cannot be after end date.');
  }
}

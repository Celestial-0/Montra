import { InvariantViolationError } from '../shared/errors';
import { FinancialAccount } from './account.entity';

export function assertValidAccount(account: FinancialAccount): void {
  if (!account.name || !account.name.trim()) {
    throw new InvariantViolationError('Account name cannot be empty.');
  }

  if (account.currency !== account.initialBalance.currency) {
    throw new InvariantViolationError(
      `Account currency (${account.currency}) must match initial balance currency (${account.initialBalance.currency}).`
    );
  }

  if (account.currency !== account.currentBalance.currency) {
    throw new InvariantViolationError(
      `Account currency (${account.currency}) must match current balance currency (${account.currentBalance.currency}).`
    );
  }
}

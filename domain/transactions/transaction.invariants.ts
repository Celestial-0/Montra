import { InvariantViolationError } from '../shared/errors';
import { Transaction } from './transaction.entity';

export function assertValidTransaction(transaction: Transaction): void {
  if (transaction.amount.amount <= 0) {
    throw new InvariantViolationError('Transaction amount must be strictly greater than 0.');
  }

  if (transaction.type === 'expense' && transaction.direction !== 'debit') {
    throw new InvariantViolationError('Expense transaction must have debit direction.');
  }

  if (transaction.type === 'income' && transaction.direction !== 'credit') {
    throw new InvariantViolationError('Income transaction must have credit direction.');
  }

  if (transaction.type === 'transfer') {
    if (!transaction.transferTargetAccountId && !transaction.linkedTransactionId) {
      throw new InvariantViolationError('Transfer transaction must specify a target account ID or linked transaction.');
    }
    if (transaction.transferTargetAccountId && transaction.accountId === transaction.transferTargetAccountId) {
      throw new InvariantViolationError('Source and target accounts for a transfer cannot be identical.');
    }
  }
}

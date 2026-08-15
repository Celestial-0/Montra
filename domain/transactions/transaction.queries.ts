import { DomainError, NotFoundError } from '../shared/errors';
import { CategoryId, TransactionId } from '../shared/ids';
import { Result } from '../shared/result';
import { ScopeSpendingFilter, SpendingQueryPort } from '../shared/spending-query.port';
import { Transaction } from './transaction.entity';
import { TransactionFilters, TransactionRepository } from './transaction.repository';

export interface CategorySpending {
  readonly categoryId: CategoryId | string;
  readonly categoryName?: string;
  readonly amountMinor: number;
  readonly percentage: number;
}

export class GetTransactionsQuery {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(filters?: TransactionFilters): Promise<Result<Transaction[], DomainError>> {
    try {
      const transactions = await this.transactionRepo.findMany(filters);
      return Result.ok(transactions);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class GetTransactionByIdQuery {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(id: TransactionId | string): Promise<Result<Transaction, DomainError>> {
    try {
      const transaction = await this.transactionRepo.findById(id);
      if (!transaction) {
        return Result.err(new NotFoundError('Transaction', id));
      }
      return Result.ok(transaction);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class GetSpendingBreakdownQuery {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(startDate?: string, endDate?: string): Promise<Result<CategorySpending[], DomainError>> {
    try {
      const transactions = await this.transactionRepo.findMany({ startDate, endDate, type: 'expense' });
      const totalExpenseMinor = transactions.reduce((acc, t) => acc + t.amount.amount, 0);

      const map = new Map<string, number>();
      for (const tx of transactions) {
        const cat = tx.categoryId ? String(tx.categoryId) : 'uncategorized';
        map.set(cat, (map.get(cat) ?? 0) + tx.amount.amount);
      }

      const results: CategorySpending[] = [];
      for (const [categoryId, amountMinor] of map.entries()) {
        results.push({
          categoryId,
          amountMinor,
          percentage: totalExpenseMinor > 0 ? Math.round((amountMinor / totalExpenseMinor) * 100) : 0,
        });
      }

      return Result.ok(results.sort((a, b) => b.amountMinor - a.amountMinor));
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class TransactionSpendingQueryAdapter implements SpendingQueryPort {
  constructor(private transactionRepo: TransactionRepository) {}

  async getSpendingByScope(
    scopeFilter: ScopeSpendingFilter,
    startDate: string,
    endDate?: string | null
  ): Promise<number> {
    const transactions = await this.transactionRepo.findMany({
      startDate,
      endDate: endDate ?? undefined,
      type: 'expense',
    });

    const matching = transactions.filter((tx) => {
      if (scopeFilter.categoryIds && tx.categoryId) {
        if (!scopeFilter.categoryIds.includes(String(tx.categoryId))) return false;
      }
      if (scopeFilter.accountIds) {
        if (!scopeFilter.accountIds.includes(String(tx.accountId))) return false;
      }
      if (scopeFilter.tagIds && tx.tagIds.length > 0) {
        const hasTag = tx.tagIds.some((t) => scopeFilter.tagIds?.includes(String(t)));
        if (!hasTag) return false;
      }
      return true;
    });

    return matching.reduce((acc, tx) => acc + tx.amount.amount, 0);
  }
}

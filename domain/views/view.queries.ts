import { DomainError, NotFoundError } from '../shared/errors';
import { ViewId } from '../shared/ids';
import { Result } from '../shared/result';
import { Transaction } from '../transactions/transaction.entity';
import { TransactionRepository } from '../transactions/transaction.repository';
import { View } from './view.entity';
import { ViewRepository } from './view.repository';

export interface ViewExecutionResult {
  readonly view: View;
  readonly transactions: readonly Transaction[];
  readonly totalAmountMinor: number;
}

export class GetViewResultsQuery {
  constructor(
    private viewRepo: ViewRepository,
    private transactionRepo: TransactionRepository
  ) {}

  async execute(viewId: ViewId | string): Promise<Result<ViewExecutionResult, DomainError>> {
    try {
      const view = await this.viewRepo.findById(viewId);
      if (!view) {
        return Result.err(new NotFoundError('View', viewId));
      }

      const allTransactions = await this.transactionRepo.findMany({
        startDate: view.filters.dateFrom,
        endDate: view.filters.dateTo,
      });

      let filtered = allTransactions.filter((tx) => {
        if (view.filters.accountIds && view.filters.accountIds.length > 0) {
          if (!view.filters.accountIds.includes(String(tx.accountId))) return false;
        }
        if (view.filters.categoryIds && view.filters.categoryIds.length > 0) {
          if (!tx.categoryId || !view.filters.categoryIds.includes(String(tx.categoryId))) return false;
        }
        if (view.filters.tagIds && view.filters.tagIds.length > 0) {
          const hasMatchingTag = tx.tagIds.some((t) => view.filters.tagIds?.includes(String(t)));
          if (!hasMatchingTag) return false;
        }
        if (view.filters.types && view.filters.types.length > 0) {
          if (!view.filters.types.includes(tx.type)) return false;
        }
        if (view.filters.minAmount !== undefined) {
          if (tx.amount.amount < view.filters.minAmount) return false;
        }
        if (view.filters.maxAmount !== undefined) {
          if (tx.amount.amount > view.filters.maxAmount) return false;
        }
        return true;
      });

      // Apply sorting
      filtered.sort((a, b) => {
        let cmp = 0;
        if (view.sort.field === 'occurredAt') {
          cmp = a.occurredAt.localeCompare(b.occurredAt);
        } else if (view.sort.field === 'amount') {
          cmp = a.amount.amount - b.amount.amount;
        } else if (view.sort.field === 'description') {
          cmp = (a.description ?? '').localeCompare(b.description ?? '');
        }
        return view.sort.direction === 'asc' ? cmp : -cmp;
      });

      const totalAmountMinor = filtered.reduce((acc, tx) => acc + tx.amount.amount, 0);

      return Result.ok({
        view,
        transactions: filtered,
        totalAmountMinor,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class GetViewsQuery {
  constructor(private viewRepo: ViewRepository) {}

  async execute(): Promise<Result<View[], DomainError>> {
    try {
      const views = await this.viewRepo.findAll();
      return Result.ok(views);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

import { AccountId, CategoryId, TagId, TransactionId } from '../shared/ids';
import { Transaction, TransactionType } from './transaction.entity';

export interface TransactionFilters {
  readonly accountId?: AccountId | string;
  readonly categoryId?: CategoryId | string;
  readonly tagIds?: readonly (TagId | string)[];
  readonly type?: TransactionType;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface TransactionRepository {
  findById(id: TransactionId | string): Promise<Transaction | null>;
  findMany(filters?: TransactionFilters): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  saveBatch(transactions: readonly Transaction[]): Promise<void>;
  delete(id: TransactionId | string): Promise<void>;
}

import { AccountId, CategoryId, TagId, TransactionId } from '../shared/ids';
import { Money } from '../shared/money';

export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'refund'
  | 'adjustment'
  | 'unknown';

export type TransactionDirection = 'debit' | 'credit';

export interface SourceReference {
  readonly sourceType: 'manual' | 'csv_import' | 'bank_sync' | 'account_aggregator';
  readonly externalId?: string | null;
  readonly rawNarration?: string | null;
  readonly importedAt: string;
}

export interface TransactionProps {
  readonly id: TransactionId;
  readonly accountId: AccountId | string;
  readonly amount: Money;
  readonly direction: TransactionDirection;
  readonly type: TransactionType;
  readonly occurredAt: string; // ISO 8601
  readonly description?: string | null;
  readonly categoryId?: CategoryId | string | null;
  readonly tagIds?: readonly (TagId | string)[];
  readonly notes?: string | null;
  readonly sourceReference?: SourceReference | null;
  readonly transferTargetAccountId?: AccountId | string | null;
  readonly linkedTransactionId?: TransactionId | string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class Transaction {
  public readonly id: TransactionId;
  public readonly accountId: AccountId | string;
  public readonly amount: Money;
  public readonly direction: TransactionDirection;
  public readonly type: TransactionType;
  public readonly occurredAt: string;
  public readonly description: string | null;
  public readonly categoryId: CategoryId | string | null;
  public readonly tagIds: readonly (TagId | string)[];
  public readonly notes: string | null;
  public readonly sourceReference: SourceReference | null;
  public readonly transferTargetAccountId: AccountId | string | null;
  public readonly linkedTransactionId: TransactionId | string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.amount = props.amount;
    this.direction = props.direction;
    this.type = props.type;
    this.occurredAt = props.occurredAt;
    this.description = props.description ?? null;
    this.categoryId = props.categoryId ?? null;
    this.tagIds = props.tagIds ?? [];
    this.notes = props.notes ?? null;
    this.sourceReference = props.sourceReference ?? null;
    this.transferTargetAccountId = props.transferTargetAccountId ?? null;
    this.linkedTransactionId = props.linkedTransactionId ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isTransfer(): boolean {
    return this.type === 'transfer' || Boolean(this.transferTargetAccountId) || Boolean(this.linkedTransactionId);
  }

  isExpense(): boolean {
    return this.type === 'expense';
  }

  isIncome(): boolean {
    return this.type === 'income';
  }
}

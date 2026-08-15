import { AccountId, CategoryId, TagId, ViewId } from '../shared/ids';
import { TransactionType } from '../transactions/transaction.entity';

export interface ViewFilter {
  readonly accountIds?: readonly (AccountId | string)[];
  readonly categoryIds?: readonly (CategoryId | string)[];
  readonly tagIds?: readonly (TagId | string)[];
  readonly types?: readonly TransactionType[];
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly minAmount?: number;
  readonly maxAmount?: number;
}

export type ViewSortField = 'occurredAt' | 'amount' | 'description';
export type ViewGroupByField = 'category' | 'account' | 'month' | 'tag' | 'type' | null;

export interface ViewSort {
  readonly field: ViewSortField;
  readonly direction: 'asc' | 'desc';
}

export interface ViewProps {
  readonly id: ViewId;
  readonly name: string;
  readonly icon?: string | null;
  readonly filters: ViewFilter;
  readonly sort: ViewSort;
  readonly groupBy?: ViewGroupByField;
  readonly visualizationType?: 'table' | 'cards' | 'chart';
  readonly isPinned?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class View {
  public readonly id: ViewId;
  public readonly name: string;
  public readonly icon: string | null;
  public readonly filters: ViewFilter;
  public readonly sort: ViewSort;
  public readonly groupBy: ViewGroupByField;
  public readonly visualizationType: 'table' | 'cards' | 'chart';
  public readonly isPinned: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: ViewProps) {
    this.id = props.id;
    this.name = props.name;
    this.icon = props.icon ?? null;
    this.filters = props.filters;
    this.sort = props.sort;
    this.groupBy = props.groupBy ?? null;
    this.visualizationType = props.visualizationType ?? 'cards';
    this.isPinned = props.isPinned ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

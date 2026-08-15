export type BudgetScopeType = 'category' | 'tag' | 'account' | 'all' | 'custom';

export interface BudgetScopeProps {
  readonly type: BudgetScopeType;
  readonly targetIds?: readonly string[]; // IDs of categories, tags, or accounts
}

export class BudgetScope {
  public readonly type: BudgetScopeType;
  public readonly targetIds: readonly string[];

  constructor({ type, targetIds = [] }: BudgetScopeProps) {
    this.type = type;
    this.targetIds = targetIds;
  }

  matches(categoryId?: string | null, tagIds?: readonly string[], accountId?: string): boolean {
    if (this.type === 'all') return true;
    if (this.type === 'category' && categoryId) {
      return this.targetIds.includes(categoryId);
    }
    if (this.type === 'tag' && tagIds) {
      return tagIds.some((id) => this.targetIds.includes(id));
    }
    if (this.type === 'account' && accountId) {
      return this.targetIds.includes(accountId);
    }
    return false;
  }
}

export interface ScopeSpendingFilter {
  readonly accountIds?: readonly string[];
  readonly categoryIds?: readonly string[];
  readonly tagIds?: readonly string[];
}

export interface SpendingQueryPort {
  getSpendingByScope(
    scopeFilter: ScopeSpendingFilter,
    startDate: string,
    endDate?: string | null
  ): Promise<number>; // Returns minor units
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateBudgetInput, UpdateBudgetInput } from '@/domain/budgets';
import { useUseCases } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Query Keys ───────────────────────────────────────────────────────────────

const BUDGET_KEYS = {
  list: [QUERY_KEYS.budgets] as const,
  progress: [QUERY_KEYS.budgets, 'progress'] as const,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * List all active budgets (raw Budget entities without progress).
 * Re-evaluates whenever the budget list is invalidated.
 */
export function useBudgets() {
  const { getBudgetProgress } = useUseCases();
  // We reuse getBudgetProgress which fetches active budgets internally — the
  // list of budgets is embedded in the progress result. For a raw list we
  // extract it from the progress array.
  return useQuery({
    queryKey: BUDGET_KEYS.list,
    queryFn: async () => {
      const result = await getBudgetProgress.execute();
      if (!result.success) throw result.error;
      // Extract just the budget entities for consumers that only need metadata
      return result.data.map((p) => p.budget);
    },
  });
}

/**
 * Get all active budgets WITH their current period progress.
 * This is the primary hook for the Budget tab — includes spentAmount,
 * remainingAmount, percentageUsed, isExceeded, isWarning per budget.
 *
 * Period boundaries are computed by BudgetPeriod.currentRange() using
 * the system clock — deterministic and timezone-aware.
 */
export function useBudgetProgress() {
  const { getBudgetProgress } = useUseCases();
  return useQuery({
    queryKey: BUDGET_KEYS.progress,
    queryFn: async () => {
      const result = await getBudgetProgress.execute();
      if (!result.success) throw result.error;
      return result.data;
    },
    // Budget progress should be relatively fresh — 2 minute stale time
    // so creating a transaction immediately shows updated progress
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new budget.
 * A budget defines: scope (category/tag/account/all), period cadence,
 * target amount, and optional rollover + alert settings.
 *
 * Invalidates: budgets list + progress.
 */
export function useCreateBudget() {
  const { createBudget } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const result = await createBudget.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
    },
  });
}

/**
 * Update a budget's name, target amount, alert threshold, rollover
 * setting, or active status.
 *
 * Note: scope and period are immutable after creation (changing them
 * would alter what historical transactions count toward the budget).
 * To change scope/period, delete and recreate the budget.
 *
 * Invalidates: budgets list + progress.
 */
export function useUpdateBudget() {
  const { updateBudget } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBudgetInput) => {
      const result = await updateBudget.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
    },
  });
}

/**
 * Delete a budget permanently.
 * Does NOT delete any transactions — budgets are user-owned plans,
 * not canonical financial facts (AGENTS.md §6.15).
 *
 * Invalidates: budgets list + progress.
 */
export function useDeleteBudget() {
  const { deleteBudget } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBudget.execute(id);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
    },
  });
}

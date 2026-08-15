import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateViewInput, UpdateViewInput } from '@/domain/views';
import { useUseCases } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Query Keys ───────────────────────────────────────────────────────────────

function viewResultsKey(viewId: string) {
  return [QUERY_KEYS.views, 'results', viewId] as const;
}

function viewByIdKey(viewId: string) {
  return [QUERY_KEYS.views, 'detail', viewId] as const;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * List all saved views.
 * A View is a reusable description of how to query and display transactions —
 * NOT a copy of transaction data (AGENTS.md §5.11).
 */
export function useViews() {
  const { getViews } = useUseCases();
  return useQuery({
    queryKey: [QUERY_KEYS.views],
    queryFn: async () => {
      const result = await getViews.execute();
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}

/**
 * Execute a saved view and return its filtered, sorted transaction set.
 * Results are derived — changing a view DOES NOT modify any transaction
 * (AGENTS.md §6.9).
 *
 * Re-fetches when the view definition OR the transaction list changes.
 * `enabled` guards against null/undefined viewId.
 */
export function useViewResults(viewId: string | null | undefined) {
  const { getViewResults } = useUseCases();
  return useQuery({
    queryKey: viewResultsKey(viewId ?? ''),
    queryFn: async () => {
      const result = await getViewResults.execute(viewId!);
      if (!result.success) throw result.error;
      return result.data; // { view, transactions, totalAmountMinor }
    },
    enabled: Boolean(viewId),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new saved view with filters, sort, groupBy, and visualization type.
 * Pinned views appear at the top of the views list.
 */
export function useCreateView() {
  const { createView } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateViewInput) => {
      const result = await createView.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.views] });
    },
  });
}

/**
 * Update a view's definition (name, filters, sort, groupBy, pinned state).
 * Updating a view DOES NOT change any underlying transactions — only
 * the query specification changes (AGENTS.md §6.9).
 */
export function useUpdateView() {
  const { updateView } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateViewInput) => {
      const result = await updateView.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: (updatedView) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.views] });
      queryClient.invalidateQueries({ queryKey: viewResultsKey(String(updatedView.id)) });
      queryClient.invalidateQueries({ queryKey: viewByIdKey(String(updatedView.id)) });
    },
  });
}

/**
 * Delete a saved view.
 * No transactions are affected — only the view definition is removed.
 */
export function useDeleteView() {
  const { deleteView } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteView.execute(id);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.views] });
    },
  });
}

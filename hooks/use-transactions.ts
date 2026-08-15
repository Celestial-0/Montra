import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateTransactionInput, CreateTransferInput, UpdateTransactionInput } from '@/domain/transactions';
import { TransactionFilters } from '@/domain/transactions';
import { useUseCases } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Query Keys ───────────────────────────────────────────────────────────────

function transactionKeys(filters?: TransactionFilters) {
  return [QUERY_KEYS.transactions, filters ?? {}] as const;
}

function transactionByIdKey(id: string) {
  return [QUERY_KEYS.transactions, 'detail', id] as const;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * List transactions with optional filters.
 * Refreshes whenever filters change (accountId, categoryId, type, date range, pagination).
 */
export function useTransactions(filters?: TransactionFilters) {
  const { getTransactions } = useUseCases();
  return useQuery({
    queryKey: transactionKeys(filters),
    queryFn: async () => {
      const result = await getTransactions.execute(filters);
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}

/**
 * Fetch a single transaction by ID.
 */
export function useTransaction(id: string | null | undefined) {
  const { getTransactionById } = useUseCases();
  return useQuery({
    queryKey: transactionByIdKey(id ?? ''),
    queryFn: async () => {
      const result = await getTransactionById.execute(id!);
      if (!result.success) throw result.error;
      return result.data;
    },
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new transaction (expense, income, refund, adjustment, unknown).
 * Invalidates: transactions list, accounts (balance may change), budgets (progress changes), analytics.
 */
export function useCreateTransaction() {
  const { createTransaction } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const result = await createTransaction.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    },
  });
}

/**
 * Update an existing transaction's mutable fields (description, category, tags, notes).
 * Invalidates: transactions list, detail, budgets (category may have changed), analytics.
 */
export function useUpdateTransaction() {
  const { updateTransaction } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      const result = await updateTransaction.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: (updatedTx) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: transactionByIdKey(String(updatedTx.id)) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    },
  });
}

/**
 * Delete a transaction (also deletes the linked leg if it's a transfer).
 * Invalidates: transactions, accounts, budgets, analytics.
 */
export function useDeleteTransaction() {
  const { deleteTransaction } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTransaction.execute(id);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    },
  });
}

/**
 * Create a two-legged transfer between two accounts.
 * Creates a linked debit + credit pair — neither is counted as spending.
 * Invalidates: transactions, accounts.
 */
export function useCreateTransfer() {
  const { createTransfer } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransferInput) => {
      const result = await createTransfer.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
    },
  });
}

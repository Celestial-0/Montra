import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateAccountInput, UpdateAccountInput } from '@/domain/accounts';
import { useUseCases } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Query Keys ───────────────────────────────────────────────────────────────

function accountByIdKey(id: string) {
  return [QUERY_KEYS.accounts, 'detail', id] as const;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * List all financial accounts.
 * Returns the raw FinancialAccount entities — include balance, currency, type.
 */
export function useAccounts() {
  const { getAccountSummaries } = useUseCases();
  return useQuery({
    queryKey: [QUERY_KEYS.accounts],
    queryFn: async () => {
      const result = await getAccountSummaries.execute();
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}

/**
 * Fetch a single account by ID.
 * Enabled only when a non-empty id is provided.
 */
export function useAccount(id: string | null | undefined) {
  const { getAccountSummaries } = useUseCases();
  return useQuery({
    queryKey: accountByIdKey(id ?? ''),
    queryFn: async () => {
      // Reuse the findAll query and filter client-side — avoids a second use case.
      // For Phase 3, a dedicated GetAccountByIdQuery can be introduced.
      const result = await getAccountSummaries.execute();
      if (!result.success) throw result.error;
      const account = result.data.find((a) => String(a.id) === id);
      if (!account) throw new Error(`Account not found: ${id}`);
      return account;
    },
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new financial account.
 * Invalidates: accounts list.
 */
export function useCreateAccount() {
  const { createAccount } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAccountInput) => {
      const result = await createAccount.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
    },
  });
}

/**
 * Update an existing account's name, institution, or active status.
 * Invalidates: accounts list + individual account detail.
 */
export function useUpdateAccount() {
  const { updateAccount } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const result = await updateAccount.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: (updatedAccount) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
      queryClient.invalidateQueries({ queryKey: accountByIdKey(String(updatedAccount.id)) });
    },
  });
}

/**
 * Soft-delete (or hard-delete) a financial account.
 * Cascade-deletes transactions associated with this account (enforced at DB level).
 * Invalidates: accounts, transactions, budgets, analytics.
 */
export function useDeleteAccount() {
  const { deleteAccount } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAccount.execute(id);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
      // Transactions referencing this account are cascade-deleted by SQLite FK
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    },
  });
}

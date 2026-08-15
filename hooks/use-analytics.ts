import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Query Keys ───────────────────────────────────────────────────────────────

const ANALYTICS_KEYS = {
  spendingBreakdown: (start?: string, end?: string) =>
    [QUERY_KEYS.analytics, 'spending-breakdown', start, end] as const,
  cashFlow: (start?: string, end?: string) =>
    [QUERY_KEYS.analytics, 'cash-flow', start, end] as const,
  categoryTrends: (categoryId: string, months: number) =>
    [QUERY_KEYS.analytics, 'category-trends', categoryId, months] as const,
  transactionVolume: (start?: string, end?: string) =>
    [QUERY_KEYS.analytics, 'transaction-volume', start, end] as const,
} as const;

// ─── Spending Breakdown ───────────────────────────────────────────────────────

/**
 * Spending breakdown by category for a date range.
 * Returns `{ categoryId, categoryName, amountMinor, percentage, count }[]`
 * sorted by amount descending.
 *
 * Used on: Home summary card, Analytics screen pie chart, Budget drill-down.
 *
 * Transfers are excluded — only expense transactions contribute.
 */
export function useSpendingBreakdown(startDate?: string, endDate?: string) {
  const { getSpendingBreakdown } = useUseCases();
  return useQuery({
    queryKey: ANALYTICS_KEYS.spendingBreakdown(startDate, endDate),
    queryFn: async () => {
      const result = await getSpendingBreakdown.execute(startDate, endDate);
      if (!result.success) throw result.error;
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min — analytics don't need to be real-time
  });
}

/**
 * Income breakdown by category for a date range.
 * Returns `{ categoryId, categoryName, amountMinor, percentage, count }[]`
 */
export function useIncomeBreakdown(startDate?: string, endDate?: string) {
  const { getTransactions, getCategories } = useUseCases();
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, 'income-breakdown', startDate, endDate],
    queryFn: async () => {
      const [txResult, catResult] = await Promise.all([
        getTransactions.execute({ startDate, endDate, type: 'income' }),
        getCategories.execute(),
      ]);
      if (!txResult.success) return [];

      const transactions = (txResult.data ?? []).filter((t) => !t.isTransfer() && t.type === 'income');
      const totalIncomeMinor = transactions.reduce((sum, t) => sum + t.amount.amount, 0);

      const catMap = new Map(
        (catResult.success ? catResult.data.categories : []).map((c) => [String(c.id), c.name])
      );
      const grouped = new Map<string, { amountMinor: number; count: number }>();

      for (const tx of transactions) {
        const catId = tx.categoryId ? String(tx.categoryId) : 'uncategorized';
        const existing = grouped.get(catId) ?? { amountMinor: 0, count: 0 };
        grouped.set(catId, {
          amountMinor: existing.amountMinor + tx.amount.amount,
          count: existing.count + 1,
        });
      }

      const results = Array.from(grouped.entries()).map(([categoryId, data]) => ({
        categoryId,
        categoryName: catMap.get(categoryId) ?? (categoryId === 'uncategorized' ? 'Uncategorized' : 'Other'),
        amountMinor: data.amountMinor,
        percentage: totalIncomeMinor > 0 ? Math.round((data.amountMinor / totalIncomeMinor) * 100) : 0,
        count: data.count,
      }));

      return results.sort((a, b) => b.amountMinor - a.amountMinor);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Cash Flow ────────────────────────────────────────────────────────────────

/**
 * Cash flow summary for a date range.
 * Returns total income, total expenses, and net flow for the period.
 * Transfers are excluded from both income and expense totals.
 *
 * Used on: Home tab summary, Analytics screen header.
 */
export function useCashFlow(startDate?: string, endDate?: string) {
  const { getTransactions } = useUseCases();
  return useQuery({
    queryKey: ANALYTICS_KEYS.cashFlow(startDate, endDate),
    queryFn: async () => {
      const result = await getTransactions.execute({
        startDate,
        endDate,
      });
      if (!result.success) throw result.error;

      const transactions = result.data;
      let totalIncomeMinor = 0;
      let totalExpenseMinor = 0;

      for (const tx of transactions) {
        // Exclude transfers from cash flow calculations (AGENTS.md §6.17)
        if (tx.isTransfer()) continue;
        if (tx.type === 'income') {
          totalIncomeMinor += tx.amount.amount;
        } else if (tx.type === 'expense') {
          totalExpenseMinor += tx.amount.amount;
        }
      }

      return {
        totalIncomeMinor,
        totalExpenseMinor,
        netFlowMinor: totalIncomeMinor - totalExpenseMinor,
        transactionCount: transactions.length,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Category Trends ─────────────────────────────────────────────────────────

/**
 * Monthly spending trend for a specific category over N months.
 * Returns an array of `{ month: string (YYYY-MM), amountMinor: number }[]`
 * sorted chronologically.
 *
 * Used on: Category drill-down screen, Budget analysis.
 */
export function useCategoryTrends(
  categoryId: string | null | undefined,
  months = 6
) {
  const { getTransactions } = useUseCases();
  return useQuery({
    queryKey: ANALYTICS_KEYS.categoryTrends(categoryId ?? '', months),
    queryFn: async () => {
      const result = await getTransactions.execute({ categoryId: categoryId! });
      if (!result.success) throw result.error;

      // Bucket transactions into month groups (YYYY-MM)
      const buckets = new Map<string, number>();
      for (const tx of result.data) {
        if (tx.type === 'transfer') continue;
        const month = tx.occurredAt.slice(0, 7); // 'YYYY-MM'
        buckets.set(month, (buckets.get(month) ?? 0) + tx.amount.amount);
      }

      // Sort chronologically and limit to requested N months
      const sorted = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-months)
        .map(([month, amountMinor]) => ({ month, amountMinor }));

      return sorted;
    },
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Transaction Volume ───────────────────────────────────────────────────────

/**
 * Transaction count and average amount per day for a date range.
 * Used on: Analytics screen frequency chart.
 */
export function useTransactionVolume(startDate?: string, endDate?: string) {
  const { getTransactions } = useUseCases();
  return useQuery({
    queryKey: ANALYTICS_KEYS.transactionVolume(startDate, endDate),
    queryFn: async () => {
      const result = await getTransactions.execute({ startDate, endDate });
      if (!result.success) throw result.error;

      const transactions = result.data.filter((tx) => !tx.isTransfer());
      const totalCount = transactions.length;
      const totalAmountMinor = transactions.reduce(
        (sum, tx) => sum + tx.amount.amount,
        0
      );

      // Daily buckets: 'YYYY-MM-DD' → amount
      const dailyBuckets = new Map<string, number>();
      for (const tx of transactions) {
        const day = tx.occurredAt.slice(0, 10);
        dailyBuckets.set(day, (dailyBuckets.get(day) ?? 0) + tx.amount.amount);
      }

      const dailySeries = Array.from(dailyBuckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amountMinor]) => ({ date, amountMinor }));

      return {
        totalCount,
        totalAmountMinor,
        averageAmountMinor: totalCount > 0 ? Math.round(totalAmountMinor / totalCount) : 0,
        dailySeries,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

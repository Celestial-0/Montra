import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImportStatementInput } from '@/domain/import';
import { RawStatementRow } from '@/domain/import/import.parser';
import { useUseCases, useRepositories } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Import Statement ─────────────────────────────────────────────────────────

/**
 * Full import pipeline: parse → deduplicate → commit.
 *
 * Flow (matches ImportRecordsUseCase):
 *   1. CSVStatementParser parses raw file content into RawStatementRow[]
 *   2. normalizeRawRow() converts each row to a NormalizedFinancialRecord
 *   3. Deduplication check against existing transactions for this account
 *   4. Valid rows → Transaction entities → saveBatch()
 *   5. FinancialRecord entities created for every row (processed or skipped)
 *
 * Returns ImportSummary: { importedCount, skippedDuplicateCount, transactions, rawRecords }
 *
 * Invalidates: transactions, accounts (balance may change), budgets, analytics.
 */
export function useImportStatement() {
  const { importRecords } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ImportStatementInput) => {
      const result = await importRecords.execute(input);
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

// ─── Preview-only parse (no DB writes) ────────────────────────────────────────

/**
 * Parse a file and return the preview rows WITHOUT committing anything to the DB.
 * Used in the import flow's "preview" step before the user confirms.
 *
 * This is a mutation (not a query) because it accepts user-provided file content
 * and the result is ephemeral — it should not be cached.
 */
export function useParseStatementPreview() {
  const { importParser } = useRepositories();

  return useMutation({
    mutationFn: async ({
      fileContent,
      fileType,
    }: {
      fileContent: string;
      fileType: 'csv' | 'json';
    }): Promise<RawStatementRow[]> => {
      return importParser.parse(fileContent, fileType);
    },
  });
}

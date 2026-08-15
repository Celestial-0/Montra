import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Category,
  CreateCategoryInput,
  CreateTagInput,
  Tag,
  UpdateCategoryInput,
  UpdateTagInput,
} from '@/domain/categories';
import { useUseCases } from '@/providers/database-provider';
import { QUERY_KEYS } from '@/lib/constants';

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all categories and tags in a single query.
 * Returns `{ categories: Category[], tags: Tag[] }`.
 *
 * Categories drive the classification system. Tags are supplementary
 * many-to-many metadata. Both are user-owned semantics (AGENTS.md §2.1).
 */
export function useCategories() {
  const { getCategories } = useUseCases();
  return useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: async () => {
      const result = await getCategories.execute();
      if (!result.success) throw result.error;
      return result.data; // { categories, tags }
    },
    // Categories rarely change — 10 minute stale time is appropriate
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Convenience selector — returns only the categories array.
 */
export function useCategoriesList() {
  const query = useCategories();
  return {
    ...query,
    data: query.data?.categories,
  };
}

/**
 * Convenience selector — returns only the tags array.
 */
export function useTagsList() {
  const query = useCategories();
  return {
    ...query,
    data: query.data?.tags,
  };
}

// ─── Category Mutations ───────────────────────────────────────────────────────

/**
 * Create a new user-defined category.
 * System categories (isSystem=true) are seeded and should not be modified
 * via this mutation in the UI.
 */
export function useCreateCategory() {
  const { createCategory } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const result = await createCategory.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
    },
  });
}

/**
 * Update a category's name, icon, color, or parent.
 * System categories block edits via `assertValidCategory()` invariant.
 */
export function useUpdateCategory() {
  const { updateCategory } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const result = await updateCategory.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      // Transactions referencing this category need their display refreshed
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    },
  });
}

/**
 * Delete a category.
 * SQLite ON DELETE SET NULL ensures transactions lose the categoryId
 * rather than being deleted themselves (source facts are preserved).
 */
export function useDeleteCategory() {
  const { deleteCategory } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategory.execute(id);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    },
  });
}

// ─── Tag Mutations ────────────────────────────────────────────────────────────

/**
 * Create a new contextual tag.
 * Tags are optional many-to-many metadata — not a second category hierarchy.
 */
export function useCreateTag() {
  const { createTag } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTagInput) => {
      const result = await createTag.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
    },
  });
}

/**
 * Update a tag's name or color.
 */
export function useUpdateTag() {
  const { updateTag } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTagInput) => {
      const result = await updateTag.execute(input);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
    },
  });
}

/**
 * Delete a tag.
 * SQLite CASCADE removes junction rows in transaction_tags so no
 * transactions are deleted — only the tag association is removed.
 */
export function useDeleteTag() {
  const { deleteTag } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTag.execute(id);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
    },
  });
}

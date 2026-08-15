import { QueryClient } from '@tanstack/react-query';

/**
 * Global React Query client with tuned defaults for a local-first SQLite app.
 *
 * Key decisions:
 * - `staleTime: 5min` — queries stay fresh for 5 minutes. Since the data source
 *   is local SQLite (not a remote API), network-style "always stale" behaviour
 *   is unnecessary and would cause excessive re-reads.
 * - `gcTime: 30min` — cached results stay in memory for 30 minutes after the
 *   last observer unmounts. This keeps the app snappy when navigating back.
 * - `retry: false` — domain errors (DomainError, NotFoundError) are not
 *   transient; retrying them is wasteful. Infrastructure errors (SQLite) will
 *   surface via the error boundary immediately.
 * - `refetchOnWindowFocus: false` — the app is offline-first; window focus
 *   refetch would trigger unnecessary DB reads on every tab switch.
 * - `refetchOnReconnect: false` — all data is local; reconnecting to the
 *   network has no bearing on the local SQLite state.
 * - `throwOnError: false` — mutations return Result<T, E>; we handle errors
 *   explicitly in hooks rather than relying on React error boundaries for
 *   every mutation failure.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes
      gcTime: 1000 * 60 * 30,         // 30 minutes
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      throwOnError: false,
    },
    mutations: {
      retry: false,
      throwOnError: false,
    },
  },
});

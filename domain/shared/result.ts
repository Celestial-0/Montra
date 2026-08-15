export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; error: E; data?: never };

export const Result = {
  ok<T>(data: T): Result<T, never> {
    return { success: true, data };
  },
  err<E>(error: E): Result<never, E> {
    return { success: false, error };
  },
};

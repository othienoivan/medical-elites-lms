export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E; readonly message: string };

export function success<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function failure<E extends string>(error: E, message: string): Result<never, E> {
  return { ok: false, error, message };
}

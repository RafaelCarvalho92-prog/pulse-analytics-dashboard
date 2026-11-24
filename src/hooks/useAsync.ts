import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: T | undefined; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | undefined; error: Error };

/**
 * Minimal data-fetching hook: runs `fn` whenever `deps` change, ignores stale responses,
 * keeps the previous data while refetching and exposes a `retry` callback for error states.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    data: undefined,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ status: 'loading', data: s.data, error: null }));
    fnRef.current().then(
      (data) => {
        if (!cancelled) setState({ status: 'success', data, error: null });
      },
      (error: unknown) => {
        if (!cancelled)
          setState((s) => ({
            status: 'error',
            data: s.data,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

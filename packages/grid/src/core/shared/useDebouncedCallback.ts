import { useEffect, useLayoutEffect, useState } from 'react';

export interface Debounced<TArgs extends unknown[]> {
  /** Calls the callback once `wait` passed without another call, with the arguments of the last one. */
  run: (...args: TArgs) => void;
  /** Makes a pending call now. */
  flush: () => void;
  /** Drops a pending call. */
  cancel: () => void;
}

function createDebounced<TArgs extends unknown[]>(initial: (...args: TArgs) => void, wait: number) {
  let callback = initial;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: TArgs | undefined;
  const flush = () => {
    clearTimeout(timer);
    const args = pending;
    pending = undefined;
    if (args) callback(...args);
  };
  return {
    run: (...args) => {
      pending = args;
      clearTimeout(timer);
      timer = setTimeout(flush, wait);
    },
    flush,
    cancel: () => {
      clearTimeout(timer);
      pending = undefined;
    },
    /** Calls `next` from now on. */
    update: (next: (...args: TArgs) => void) => {
      callback = next;
    },
  } satisfies Debounced<TArgs> & { update: unknown };
}

/** A debounced `callback`. With `flushOnUnmount`, a call still pending when the component unmounts is made. */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  wait: number,
  { flushOnUnmount = false }: { flushOnUnmount?: boolean } = {}
): Debounced<TArgs> {
  const [debounced] = useState(() => createDebounced(callback, wait));
  useLayoutEffect(() => debounced.update(callback));
  useEffect(() => () => (flushOnUnmount ? debounced.flush() : debounced.cancel()), [debounced, flushOnUnmount]);
  return debounced;
}

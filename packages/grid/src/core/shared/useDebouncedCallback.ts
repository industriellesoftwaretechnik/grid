import { useEffect, useLayoutEffect, useState } from 'react';

export interface Debounced<TArgs extends unknown[]> {
  /** Calls once `wait` passed without another call, with the last call's arguments. */
  run: (...args: TArgs) => void;
  flush: () => void;
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
    update: (next: (...args: TArgs) => void) => {
      callback = next;
    },
  } satisfies Debounced<TArgs> & { update: unknown };
}

/** With `flushOnUnmount`, a call still pending on unmount is made. */
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

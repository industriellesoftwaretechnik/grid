import { useState } from 'react';

import { functionalUpdate, type OnChangeFn, type Updater } from '@tanstack/react-table';

/** Uncontrolled, it keeps the state and still reports each change to `onChange`. */
export function useControllableState<T>(
  controlled: T | undefined,
  onChange: OnChangeFn<T> | undefined,
  initial: () => T
): [T, (updater: Updater<T>) => void] {
  const [own, setOwn] = useState(initial);
  if (controlled !== undefined) return [controlled, (updater) => onChange?.(updater)];
  return [
    own,
    (updater) => {
      setOwn((current) => functionalUpdate(updater, current));
      onChange?.(updater);
    },
  ];
}

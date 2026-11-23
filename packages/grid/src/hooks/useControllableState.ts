import { useState } from 'react';

import { functionalUpdate, type OnChangeFn, type Updater } from '@tanstack/react-table';

/**
 * A state slice the host may control. Given `controlled`, it shows that and hands every change to `onChange`.
 * Otherwise it keeps the state itself and also reports each change to `onChange`. Changes are TanStack's updaters,
 * values or functions of the current state.
 */
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

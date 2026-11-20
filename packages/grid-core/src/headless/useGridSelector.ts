import { useSelector } from '@tanstack/react-store';

interface Source<T> {
  get: () => T;
  subscribe: (listener: (value: T) => void) => { unsubscribe: () => void };
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length && keys.every((key) => Object.is(Reflect.get(a, key), Reflect.get(b, key)))
  );
}

/**
 * Subscribes a component to what `selector` reads from a table atom or store; it re-renders when the result changes,
 * compared shallowly. The headless hooks build on this rather than on `<Subscribe>`, so a UI layer gets plain values.
 * Hooks that read table methods after it opt out of the React Compiler (`'use no memo'`): the compiler would keep their
 * results while the row, cell or column object stays the same.
 */
export function useGridSelector<TSource, TSelected>(
  source: Source<TSource>,
  selector: (value: TSource) => TSelected
): TSelected {
  return useSelector(source, selector, { compare: shallowEqual });
}

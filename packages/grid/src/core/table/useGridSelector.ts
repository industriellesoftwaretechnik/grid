import { useSelector } from '@tanstack/react-store';

import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import { sameValue } from '#/core/shared/sameValue.ts';

/**
 * Subscribes a component to what `selector` reads from the table: its state, rows, columns or meta. The selector runs
 * whenever any of these change, and the component re-renders only when the result does, compared by value through
 * arrays and plain objects. So the store, not a parent's render, decides when a grid component renders, and the React
 * Compiler memoizes the rest.
 *
 * Whatever depends on the table's state must come out of a selector: a row, cell or column object keeps its identity
 * while the state behind it changes, so the compiler would keep a value computed from it in the component body.
 * Selectors return primitives, or objects the table keeps such as rows and cells, so that their results compare equal
 * while nothing changed.
 */
export function useGridSelector<TSelected>(table: { gridStore: GridStore }, selector: () => TSelected): TSelected {
  return useSelector(table.gridStore, selector, { compare: sameValue });
}

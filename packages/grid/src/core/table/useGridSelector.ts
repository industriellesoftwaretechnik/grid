import { useSelector } from '@tanstack/react-store';

import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import { sameValue } from '#/core/shared/sameValue.ts';

/**
 * Subscribes to what `selector` reads from the table (state, rows, columns, meta) and re-renders only when the result
 * changes, compared by value through arrays and plain objects.
 *
 * Whatever depends on table state must come out of a selector: rows, cells and columns keep their identity while
 * their state changes, so the React Compiler would keep a value computed from them in the render body. Return
 * primitives or objects the table keeps, so results compare equal while nothing changed.
 */
export function useGridSelector<TSelected>(table: { gridStore: GridStore }, selector: () => TSelected): TSelected {
  return useSelector(table.gridStore, selector, { compare: sameValue });
}

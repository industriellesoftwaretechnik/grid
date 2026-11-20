import { functionalUpdate, type ColumnVisibilityState, type Updater } from '@tanstack/react-table';

/**
 * Applies the table's visibility update to the user's own choices. The table sees `forced` over the user's choices,
 * so for those columns the user's choice is kept rather than the forced value taken over.
 */
export function updateOwnVisibility(
  own: ColumnVisibilityState,
  updater: Updater<ColumnVisibilityState>,
  forced: ColumnVisibilityState
): ColumnVisibilityState {
  const next = { ...functionalUpdate(updater, { ...own, ...forced }) };
  for (const columnId of Object.keys(forced)) {
    const choice = own[columnId];
    if (choice === undefined) delete next[columnId];
    else next[columnId] = choice;
  }
  return next;
}

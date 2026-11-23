import type { ColumnVisibilityState, Updater } from '@tanstack/react-table';

/** Shows or hides the columns as the user's choice. */
export function setColumnsVisible(
  table: { setColumnVisibility: (updater: Updater<ColumnVisibilityState>) => void },
  columnIds: readonly string[],
  visible: boolean
) {
  table.setColumnVisibility((current) => ({
    ...current,
    ...Object.fromEntries(columnIds.map((columnId) => [columnId, visible])),
  }));
}

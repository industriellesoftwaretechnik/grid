import type { RowData, RowSelectionState } from '@tanstack/react-table';

import type { CoreTable, GridRow } from '#/core/types.ts';

/**
 * The selection without the ids of group rows. Selecting a group selects its records too, and TanStack would keep the
 * group's id after ungrouping, where nothing can deselect it again. Group rows show the state of their records instead.
 */
export function withoutGroupRows<TData extends RowData>(
  table: CoreTable<TData>,
  selection: RowSelectionState
): RowSelectionState {
  const { rowsById } = table.getGroupedRowModel();
  const ids = Object.keys(selection);
  const kept = ids.filter((id) => rowsById[id]?.getIsGrouped() !== true);
  return kept.length === ids.length ? selection : Object.fromEntries(kept.map((id) => [id, true as const]));
}

// A group row stands for its records, so its state comes from the leaf rows. TanStack also counts the ids of
// nested group rows, which are only selected when their own checkbox is clicked.
export function rowSelectionState<TData extends RowData>(row: GridRow<TData>) {
  // A tree node is a record of its own: it is checked only when selected itself, and partly when some below it are.
  if (!row.getIsGrouped()) {
    const checked = row.getIsSelected();
    return { checked, indeterminate: !checked && (row.getIsSomeSelected() || row.getIsAllSubRowsSelected()) };
  }
  const leaves = row.getLeafRows().filter((leaf) => !leaf.getIsGrouped() && leaf.getCanSelect());
  const selected = leaves.filter((leaf) => leaf.getIsSelected()).length;
  return {
    checked: leaves.length > 0 && selected === leaves.length,
    indeterminate: selected > 0 && selected < leaves.length,
  };
}

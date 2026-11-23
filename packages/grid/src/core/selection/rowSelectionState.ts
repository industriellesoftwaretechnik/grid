import type { RowData, RowSelectionState } from '@tanstack/react-table';

import type { CoreTable, GridRow } from '#/core/table/types.ts';

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

interface SelectionState {
  checked: boolean;
  indeterminate: boolean;
}

// Components ask on every change of the table, and a group row may stand for many records.
const groupStates = new WeakMap<object, { selection: RowSelectionState; state: SelectionState }>();

/**
 * Whether a row's checkbox is checked or partly checked. A group row stands for its records, so its state comes from
 * the leaf rows.
 */
export function rowSelectionState<TData extends RowData>(row: GridRow<TData>): SelectionState {
  // A tree node is a record of its own: it is checked only when selected itself, and partly when some below it are.
  if (!row.getIsGrouped()) {
    const checked = row.getIsSelected();
    return { checked, indeterminate: !checked && (row.getIsSomeSelected() || row.getIsAllSubRowsSelected()) };
  }
  const selection = row.table.atoms.rowSelection.get();
  const cached = groupStates.get(row);
  if (cached?.selection === selection) return cached.state;
  const leaves = row.getLeafRows().filter((leaf) => !leaf.getIsGrouped() && leaf.getCanSelect());
  const selected = leaves.filter((leaf) => leaf.getIsSelected()).length;
  const state = {
    checked: leaves.length > 0 && selected === leaves.length,
    indeterminate: selected > 0 && selected < leaves.length,
  };
  groupStates.set(row, { selection, state });
  return state;
}

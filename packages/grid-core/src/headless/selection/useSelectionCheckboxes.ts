import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable, GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { rowSelectionState } from '#/logic/selection/rowSelectionState.ts';

/** The header checkbox of the selection column: all rows, some (indeterminate) or none. */
export function useSelectAllCheckbox<TData extends RowData>(table: CoreTable<TData>) {
  'use no memo';
  const { checked, indeterminate } = useGridSelector(table.atoms.rowSelection, () => {
    const all = table.getIsAllRowsSelected();
    return { checked: all, indeterminate: !all && table.getIsSomeRowsSelected() };
  });

  return {
    checked,
    indeterminate,
    label: gridMeta(table).t('select.all'),
    toggle: (next: boolean) => table.toggleAllRowsSelected(next),
  };
}

/** A row's checkbox. A group row is indeterminate while some of its rows are selected. */
export function useRowCheckbox<TData extends RowData>(row: GridRow<TData>) {
  'use no memo';
  const { checked, indeterminate } = useGridSelector(row.table.atoms.rowSelection, () => rowSelectionState(row));

  return {
    checked,
    indeterminate,
    disabled: !row.getCanSelect(),
    label: gridMeta(row.table).t('select.row'),
    /** With Shift held, selects the rows between the last one toggled and this one. */
    toggle: (next: boolean, shiftKey = false) =>
      row.getToggleSelectedHandler()({ target: { checked: next }, shiftKey }),
  };
}

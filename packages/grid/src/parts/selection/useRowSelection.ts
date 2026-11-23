import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import { rowSelectionState } from '#/core/selection/rowSelectionState.ts';
import type { CoreTable, GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface SelectionCheckboxModel {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  label: string;
  /** Sets the selection; `range` (Shift held) selects the rows between the last one toggled and this one. */
  toggle: (checked: boolean, range?: boolean) => void;
}

/** The header checkbox of the selection column: all rows, some (indeterminate) or none. */
export function useSelectAll<TData extends RowData>(table: CoreTable<TData>): SelectionCheckboxModel {
  const t = useTranslate(table);
  const { checked, indeterminate } = useGridSelector(table, () => {
    const all = table.getIsAllRowsSelected();
    return { checked: all, indeterminate: !all && table.getIsSomeRowsSelected() };
  });

  return {
    checked,
    indeterminate,
    disabled: false,
    label: t('select.all'),
    toggle: (next) => table.toggleAllRowsSelected(next),
  };
}

/** A row's checkbox. A group row is indeterminate while some of its rows are selected. */
export function useRowSelect<TData extends RowData>(row: GridRow<TData>): SelectionCheckboxModel {
  const t = useTranslate(row.table);
  const { checked, indeterminate, disabled } = useGridSelector(row.table, () => ({
    ...rowSelectionState(row),
    disabled: !row.getCanSelect(),
  }));

  return {
    checked,
    indeterminate,
    disabled,
    label: t('select.row'),
    toggle: (next, range = false) => row.getToggleSelectedHandler()({ target: { checked: next }, shiftKey: range }),
  };
}

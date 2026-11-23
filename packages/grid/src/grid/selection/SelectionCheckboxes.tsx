import type { RowData } from '@tanstack/react-table';

import type { CoreTable, GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { Checkbox } from '#/internal/components/checkbox.tsx';
import { rowSelectionState } from '#/logic/selection/rowSelectionState.ts';

/** The header checkbox of the selection column: all rows, some (indeterminate) or none. */
export function SelectAllCheckbox<TData extends RowData>({ table }: { table: CoreTable<TData> }) {
  const t = useTranslate(table);
  const { checked, indeterminate } = useGridSelector(table, () => {
    const all = table.getIsAllRowsSelected();
    return { checked: all, indeterminate: !all && table.getIsSomeRowsSelected() };
  });

  return (
    <Checkbox
      aria-label={t('select.all')}
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(next) => table.toggleAllRowsSelected(next)}
    />
  );
}

/** A row's checkbox. A group row is indeterminate while some of its rows are selected. */
export function RowCheckbox<TData extends RowData>({ row }: { row: GridRow<TData> }) {
  const t = useTranslate(row.table);
  const { checked, indeterminate, disabled } = useGridSelector(row.table, () => ({
    ...rowSelectionState(row),
    disabled: !row.getCanSelect(),
  }));

  return (
    <span className="ig:flex ig:justify-center">
      <Checkbox
        aria-label={t('select.row')}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onClick={(event) => event.stopPropagation()}
        // With Shift held, selects the rows between the last one toggled and this one.
        onCheckedChange={(next, { event }) =>
          row.getToggleSelectedHandler()({
            target: { checked: next },
            shiftKey: 'shiftKey' in event && event.shiftKey === true,
          })
        }
      />
    </span>
  );
}

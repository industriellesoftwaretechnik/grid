import { useRef } from 'react';

import { messages } from '@/components/data-grid/messages';
import { Checkbox } from '@/components/ui/checkbox';
import { useRowSelect, useSelectAll, type CoreTable, type GridRow } from '@istec/grid';

/** The header checkbox of the selection column: all rows, some (indeterminate) or none. */
export function SelectAllCheckbox<TData extends object>({ table }: { table: CoreTable<TData> }) {
  const select = useSelectAll(table);
  return (
    <span className="flex justify-center">
      <Checkbox
        aria-label={messages.selectAll}
        checked={select.checked}
        indeterminate={select.indeterminate}
        onCheckedChange={(next) => select.toggle(next)}
      />
    </span>
  );
}

/** A row's checkbox; with Shift held, it selects the rows between the last one toggled and this one. */
export function RowCheckbox<TData extends object>({ row }: { row: GridRow<TData> }) {
  const select = useRowSelect(row);
  const shift = useRef(false);

  return (
    <span className="flex justify-center">
      <Checkbox
        aria-label={messages.selectRow}
        checked={select.checked}
        indeterminate={select.indeterminate}
        disabled={select.disabled}
        onClick={(event) => {
          event.stopPropagation();
          shift.current = event.shiftKey;
        }}
        onCheckedChange={(next) => select.toggle(next, shift.current)}
      />
    </span>
  );
}

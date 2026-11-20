import type { RowData } from '@tanstack/react-table';

import { Checkbox } from '#/internal/components/checkbox.tsx';
import { useRowCheckbox, useSelectAllCheckbox, type CoreTable, type GridRow } from '@istec/grid-core';

export function SelectAllCheckbox<TData extends RowData>({ table }: { table: CoreTable<TData> }) {
  const { checked, indeterminate, label, toggle } = useSelectAllCheckbox(table);
  return <Checkbox aria-label={label} checked={checked} indeterminate={indeterminate} onCheckedChange={toggle} />;
}

export function RowCheckbox<TData extends RowData>({ row }: { row: GridRow<TData> }) {
  const { checked, indeterminate, disabled, label, toggle } = useRowCheckbox(row);
  return (
    <span className="flex justify-center">
      <Checkbox
        aria-label={label}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onClick={(event) => event.stopPropagation()}
        onCheckedChange={(next, { event }) => toggle(next, 'shiftKey' in event && event.shiftKey === true)}
      />
    </span>
  );
}

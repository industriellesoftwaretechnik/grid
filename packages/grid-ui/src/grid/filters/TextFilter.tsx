import type { RowData } from '@tanstack/react-table';

import { ClearFilterButton } from '#/grid/filters/ClearFilterButton.tsx';
import { Input } from '#/internal/components/input.tsx';
import { useTextFilter, type GridColumn } from '@istec/grid-core';

export function TextFilter<TData extends RowData>({ column }: { column: GridColumn<TData> }) {
  const filter = useTextFilter(column);

  return (
    <>
      <Input
        aria-label={filter.label}
        placeholder={filter.label}
        value={filter.text}
        onChange={(event) => filter.change(event.target.value)}
      />
      <ClearFilterButton label={filter.clearLabel} enabled={filter.canClear} onClear={filter.clear} />
    </>
  );
}

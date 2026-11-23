import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { ClearFilterButton } from '#/grid/filters/ClearFilterButton.tsx';
import { useTextFilter } from '#/grid/filters/useFilterEditors.ts';
import { Input } from '#/internal/components/input.tsx';

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

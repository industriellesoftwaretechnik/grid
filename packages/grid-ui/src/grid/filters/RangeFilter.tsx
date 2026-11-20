import type { RowData } from '@tanstack/react-table';

import { ClearFilterButton } from '#/grid/filters/ClearFilterButton.tsx';
import { Input } from '#/internal/components/input.tsx';
import { Label } from '#/internal/components/label.tsx';
import { useRangeFilter, type GridColumn } from '@istec/grid-core';

export function RangeFilter<TData extends RowData>({
  column,
  type,
}: {
  column: GridColumn<TData>;
  type: 'number' | 'date';
}) {
  const filter = useRangeFilter(column, type);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
        {filter.bounds.map((bound) => (
          <div key={bound.id} className="contents">
            <Label htmlFor={bound.id}>{bound.label}</Label>
            <Input
              id={bound.id}
              type={filter.type}
              value={bound.text}
              placeholder={bound.placeholder}
              onChange={(event) => bound.change(event.target.value)}
            />
          </div>
        ))}
      </div>
      <ClearFilterButton label={filter.clearLabel} enabled={filter.canClear} onClear={filter.clear} />
    </>
  );
}

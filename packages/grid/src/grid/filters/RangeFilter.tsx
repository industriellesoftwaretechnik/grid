import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { ClearFilterButton } from '#/grid/filters/ClearFilterButton.tsx';
import { useRangeFilter } from '#/grid/filters/useFilterEditors.ts';
import { Input } from '#/internal/components/input.tsx';
import { Label } from '#/internal/components/label.tsx';

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
      <div className="ig:grid ig:grid-cols-[auto_1fr] ig:items-center ig:gap-x-2 ig:gap-y-1.5">
        {filter.bounds.map((bound) => (
          <div key={bound.id} className="ig:contents">
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

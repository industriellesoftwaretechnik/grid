import { FlexRender } from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';

import type { HeaderSlot } from '#/grid/header/headerRows.ts';

const sortIcons = { asc: <ArrowUp />, desc: <ArrowDown /> };

/** The header's label; a button that sorts where the column can be sorted. */
export function HeaderLabel<TData extends object>({
  slot: { header, toggleSorting, sorted, sortPosition },
}: {
  slot: HeaderSlot<TData>;
}) {
  const label = (
    <span className="ig:truncate">
      <FlexRender header={header} />
    </span>
  );
  if (!toggleSorting) return label;

  return (
    <button
      type="button"
      onClick={toggleSorting}
      className="ig:flex ig:min-w-0 ig:cursor-pointer ig:items-center ig:gap-1 ig:[&_svg]:size-3.5 ig:[&_svg]:shrink-0"
    >
      {label}
      {sorted && (
        <span className="ig:flex ig:items-center">
          {sortIcons[sorted]}
          {sortPosition > 0 && (
            <span className="ig:text-[10px] ig:leading-none ig:text-muted-foreground ig:tabular-nums">
              {sortPosition}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

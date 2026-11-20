import { FlexRender } from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';

import type { HeaderSlot } from '@istec/grid-core';

const sortIcons = { asc: <ArrowUp />, desc: <ArrowDown /> };

/** The header's label; a button that sorts where the column can be sorted. */
export function HeaderLabel<TData extends object>({
  slot: { header, toggleSorting, sorted, sortPosition },
}: {
  slot: HeaderSlot<TData>;
}) {
  const label = (
    <span className="truncate">
      <FlexRender header={header} />
    </span>
  );
  if (!toggleSorting) return label;

  return (
    <button
      type="button"
      onClick={toggleSorting}
      className="flex min-w-0 cursor-pointer items-center gap-1 [&_svg]:size-3.5 [&_svg]:shrink-0"
    >
      {label}
      {sorted && (
        <span className="flex items-center">
          {sortIcons[sorted]}
          {sortPosition > 0 && (
            <span className="text-[10px] leading-none text-muted-foreground tabular-nums">{sortPosition}</span>
          )}
        </span>
      )}
    </button>
  );
}

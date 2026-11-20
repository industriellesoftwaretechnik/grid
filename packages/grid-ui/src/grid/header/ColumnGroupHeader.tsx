import { FlexRender } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useColumnGroupHeader, type HeaderSlot } from '@istec/grid-core';

export function ColumnGroupHeader<TData extends object>({ slot }: { slot: HeaderSlot<TData> }) {
  const group = useColumnGroupHeader(slot);

  return (
    <div className="flex h-full items-center gap-1 px-2">
      <span className="truncate">
        <FlexRender header={slot.header} />
      </span>
      {group.collapsible && (
        <button
          type="button"
          aria-label={group.toggleLabel}
          aria-expanded={!group.collapsed}
          onClick={group.toggle}
          className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-foreground/10 hover:text-foreground [&_svg]:size-3.5"
        >
          {group.collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}
    </div>
  );
}

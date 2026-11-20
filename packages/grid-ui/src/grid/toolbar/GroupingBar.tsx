import { ChevronsDownUp, ChevronsUpDown, X } from 'lucide-react';

import { Badge } from '#/internal/components/badge.tsx';
import { Button } from '#/internal/components/button.tsx';
import { useGroupingBar } from '@istec/grid-core';

/** The grouped columns, and buttons that open and close all groups or tree nodes. */
export function GroupingBar() {
  const bar = useGroupingBar();
  if (!bar.visible) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {bar.label && <span className="text-muted-foreground">{bar.label}</span>}
      {bar.groups.map((group) => (
        <Badge key={group.id} variant="secondary" className="gap-1 pr-0.5">
          {group.label}
          <button
            type="button"
            aria-label={bar.removeLabel}
            onClick={group.remove}
            className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={bar.expandAll.onClick}>
        <ChevronsUpDown />
        {bar.expandAll.label}
      </Button>
      <Button variant="ghost" size="sm" onClick={bar.collapseAll.onClick}>
        <ChevronsDownUp />
        {bar.collapseAll.label}
      </Button>
    </div>
  );
}

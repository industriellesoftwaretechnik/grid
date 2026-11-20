import { cn } from 'cn';
import { ChevronsDownUp, ChevronsUpDown, Group } from 'lucide-react';

import { GroupChips } from '#/grid/grouping/GroupChips.tsx';
import { barClassName } from '#/grid/styles.ts';
import { Button } from '#/internal/components/button.tsx';
import { useGroupPanel, type GridInstance } from '@istec/grid-core';

/** The row above the header that shows the grouping. Header columns are dragged into it to group by them. */
export function GroupPanel<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const panel = useGroupPanel(table);

  return (
    <div
      {...panel.panelProps}
      role="toolbar"
      aria-label={panel.label}
      className={cn(
        barClassName,
        'gap-1 border-b transition-colors select-none',
        panel.accepting && 'bg-accent',
        panel.rejecting && 'bg-destructive/10'
      )}
    >
      <Group className="size-3.5 shrink-0 text-muted-foreground" />
      {!panel.grouped && !panel.pending ? (
        <span className="px-1 text-muted-foreground">{panel.placeholder}</span>
      ) : (
        <GroupChips table={table} pending={panel.pending} />
      )}
      {panel.grouped && (
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="xs" onClick={panel.expandAll.onClick}>
            <ChevronsUpDown />
            {panel.expandAll.label}
          </Button>
          <Button variant="ghost" size="xs" onClick={panel.collapseAll.onClick}>
            <ChevronsDownUp />
            {panel.collapseAll.label}
          </Button>
        </div>
      )}
    </div>
  );
}

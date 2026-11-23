import { cn } from 'cn';
import { ChevronsDownUp, ChevronsUpDown, Group } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import { GroupChips } from '#/grid/grouping/GroupChips.tsx';
import { useGroupPanel } from '#/grid/grouping/useGroupPanel.ts';
import { barClassName } from '#/grid/styles.ts';
import { Button } from '#/internal/components/button.tsx';

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
        'ig:gap-1 ig:border-b ig:transition-colors ig:select-none',
        panel.accepting && 'ig:bg-accent',
        panel.rejecting && 'ig:bg-destructive/10'
      )}
    >
      <Group className="ig:size-3.5 ig:shrink-0 ig:text-muted-foreground" />
      {!panel.grouped && !panel.pending ? (
        <span className="ig:px-1 ig:text-muted-foreground">{panel.placeholder}</span>
      ) : (
        <GroupChips table={table} pending={panel.pending} />
      )}
      {panel.grouped && (
        <div className="ig:ml-auto ig:flex ig:items-center">
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

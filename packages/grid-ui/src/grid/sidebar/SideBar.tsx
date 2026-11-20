import { cn } from 'cn';
import { Columns3, ListFilter, X } from 'lucide-react';

import { ColumnsPanel } from '#/grid/sidebar/ColumnsPanel.tsx';
import { FiltersPanel } from '#/grid/sidebar/FiltersPanel.tsx';
import { useSideBar, type GridInstance } from '@istec/grid-core';

const icons = { columns: <Columns3 />, filters: <ListFilter /> };

/** Tabs along the right edge that open the columns or the filters beside the rows. */
export function SideBar<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const sideBar = useSideBar(table);

  return (
    <div className="flex min-h-0 border-l bg-background">
      {sideBar.open && (
        <aside aria-label={sideBar.openLabel} className="flex w-64 min-w-0 flex-col border-r">
          <div className="flex h-9 shrink-0 items-center justify-between border-b bg-muted px-2 font-medium">
            {sideBar.openLabel}
            <button
              type="button"
              aria-label={sideBar.closeLabel}
              title={sideBar.closeLabel}
              onClick={sideBar.close}
              className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {sideBar.open === 'columns' ? <ColumnsPanel table={table} /> : <FiltersPanel table={table} />}
          </div>
        </aside>
      )}
      <div role="tablist" aria-orientation="vertical" className="flex w-6 flex-col bg-muted">
        {sideBar.tabs.map((tab) => (
          <button
            key={tab.panel}
            type="button"
            role="tab"
            aria-selected={tab.selected}
            onClick={tab.toggle}
            className={cn(
              'flex items-center gap-1 border-b px-1 py-2 text-muted-foreground [writing-mode:vertical-rl] hover:text-foreground [&_svg]:size-3 [&_svg]:rotate-90',
              tab.selected && 'bg-background text-foreground'
            )}
          >
            {icons[tab.panel]}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';

import { cn } from 'cn';
import { Columns3, ListFilter, X } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import { ColumnsPanel } from '#/grid/sidebar/ColumnsPanel.tsx';
import { FiltersPanel } from '#/grid/sidebar/FiltersPanel.tsx';
import { useTranslate } from '#/hooks/useTranslate.ts';

const panels = ['columns', 'filters'] as const;
type SideBarPanel = (typeof panels)[number];

const icons = { columns: <Columns3 />, filters: <ListFilter /> };

/** AG Grid's side bar: tabs along the right edge that open the columns or the filters beside the rows. */
export function SideBar<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const [open, setOpen] = useState<SideBarPanel>();
  const t = useTranslate(table);
  const labels: Record<SideBarPanel, string> = { columns: t('columns'), filters: t('filters') };
  const closeLabel = t('side-bar.close');

  return (
    <div className="ig:flex ig:min-h-0 ig:border-l ig:bg-background">
      {open && (
        <aside aria-label={labels[open]} className="ig:flex ig:w-64 ig:min-w-0 ig:flex-col ig:border-r">
          <div className="ig:flex ig:h-9 ig:shrink-0 ig:items-center ig:justify-between ig:border-b ig:bg-muted ig:px-2 ig:font-medium">
            {labels[open]}
            <button
              type="button"
              aria-label={closeLabel}
              title={closeLabel}
              onClick={() => setOpen(undefined)}
              className="ig:rounded-sm ig:p-0.5 ig:text-muted-foreground ig:hover:bg-muted-foreground/20 ig:hover:text-foreground"
            >
              <X className="ig:size-3.5" />
            </button>
          </div>
          <div className="ig:min-h-0 ig:flex-1 ig:overflow-y-auto">
            {open === 'columns' ? <ColumnsPanel table={table} /> : <FiltersPanel table={table} />}
          </div>
        </aside>
      )}
      <div role="tablist" aria-orientation="vertical" className="ig:flex ig:w-6 ig:flex-col ig:bg-muted">
        {panels.map((panel) => (
          <button
            key={panel}
            type="button"
            role="tab"
            aria-selected={open === panel}
            onClick={() => setOpen(open === panel ? undefined : panel)}
            className={cn(
              'ig:flex ig:items-center ig:gap-1 ig:border-b ig:px-1 ig:py-2 ig:text-muted-foreground ig:[writing-mode:vertical-rl] ig:hover:text-foreground ig:[&_svg]:size-3 ig:[&_svg]:rotate-90',
              open === panel && 'ig:bg-background ig:text-foreground'
            )}
          >
            {icons[panel]}
            {labels[panel]}
          </button>
        ))}
      </div>
    </div>
  );
}

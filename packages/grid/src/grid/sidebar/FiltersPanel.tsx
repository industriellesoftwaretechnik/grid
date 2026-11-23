import { cn } from 'cn';
import { ChevronRight, X } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import { FilterEditor } from '#/grid/filters/FilterEditor.tsx';
import { useFiltersPanel } from '#/grid/sidebar/useFiltersPanel.ts';
import { Button } from '#/internal/components/button.tsx';

/** Every filterable column with its filter as text; opening one shows its editor in place. */
export function FiltersPanel<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const { items, filtered, clearAll, clearAllLabel } = useFiltersPanel(table);

  return (
    <div className="ig:flex ig:flex-col">
      {filtered && (
        <Button variant="ghost" size="sm" className="ig:m-1 ig:self-start" onClick={clearAll}>
          <X />
          {clearAllLabel}
        </Button>
      )}
      {items.map(({ column, filter, label, summary, open, toggle }) => {
        return (
          <div key={column.id} className="ig:border-b">
            <button
              type="button"
              aria-expanded={open}
              onClick={toggle}
              className="ig:flex ig:w-full ig:items-start ig:gap-1.5 ig:px-2 ig:py-1.5 ig:text-left ig:hover:bg-muted"
            >
              <ChevronRight
                className={cn('ig:mt-0.5 ig:size-3.5 ig:shrink-0 ig:transition-transform', open && 'ig:rotate-90')}
              />
              <span className="ig:min-w-0 ig:flex-1">
                <span className="ig:block ig:truncate ig:font-medium">{label}</span>
                {summary && (
                  <span className="ig:block ig:truncate ig:text-primary" title={summary}>
                    {summary}
                  </span>
                )}
              </span>
            </button>
            {open && (
              <div className="ig:flex ig:flex-col ig:gap-2 ig:pt-1 ig:pr-2 ig:pb-3 ig:pl-7">
                <FilterEditor column={column} kind={filter} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

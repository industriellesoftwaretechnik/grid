import { cn } from 'cn';
import { ChevronRight, X } from 'lucide-react';

import { FilterEditor } from '#/grid/filters/FilterEditor.tsx';
import { Button } from '#/internal/components/button.tsx';
import { columnMeta, useFiltersPanel, type GridInstance } from '@istec/grid-core';

/** Every filterable column with its filter as text; opening one shows its editor in place. */
export function FiltersPanel<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const { items, filtered, clearAll, clearAllLabel } = useFiltersPanel(table);

  return (
    <div className="flex flex-col">
      {filtered && (
        <Button variant="ghost" size="sm" className="m-1 self-start" onClick={clearAll}>
          <X />
          {clearAllLabel}
        </Button>
      )}
      {items.map(({ column, label, summary, open, toggle }) => {
        const { filter } = columnMeta(column);
        return (
          <div key={column.id} className="border-b">
            <button
              type="button"
              aria-expanded={open}
              onClick={toggle}
              className="flex w-full items-start gap-1.5 px-2 py-1.5 text-left hover:bg-muted"
            >
              <ChevronRight className={cn('mt-0.5 size-3.5 shrink-0 transition-transform', open && 'rotate-90')} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{label}</span>
                {summary && (
                  <span className="block truncate text-primary" title={summary}>
                    {summary}
                  </span>
                )}
              </span>
            </button>
            {open && filter && (
              <div className="flex flex-col gap-2 pt-1 pr-2 pb-3 pl-7">
                <FilterEditor column={column} kind={filter} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

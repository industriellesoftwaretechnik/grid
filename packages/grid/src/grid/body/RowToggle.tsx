import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { ChevronRight } from 'lucide-react';

import type { GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';

/** A cell's content behind the chevron that expands its row: a group, a tree node or a master row. */
export function RowToggle<TData extends RowData>({
  row,
  level,
  showCount = false,
  children,
}: {
  row: GridRow<TData>;
  /** The indentation, in levels. */
  level: number;
  /** Shows the number of records in the group. */
  showCount?: boolean;
  children: ReactNode;
}) {
  const t = useTranslate(row.table);
  const { canExpand, expanded } = useGridSelector(row.table, () => ({
    canExpand: row.getCanExpand(),
    expanded: row.getIsExpanded(),
  }));

  return (
    <span className="ig:flex ig:max-w-full ig:items-center ig:gap-1" style={{ paddingLeft: level * 16 }}>
      {canExpand ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? t('rows.collapse') : t('rows.expand')}
          onClick={(event) => {
            // The row's own click handler does not see it.
            event.stopPropagation();
            row.toggleExpanded();
          }}
          className="ig:-m-0.5 ig:shrink-0 ig:cursor-pointer ig:rounded-sm ig:p-0.5 ig:hover:bg-muted-foreground/20"
        >
          <ChevronRight className={cn('ig:size-3.5 ig:transition-transform', expanded && 'ig:rotate-90')} />
        </button>
      ) : (
        // Rows that cannot expand keep the toggle's space, so the content of a level lines up.
        <span aria-hidden className="ig:size-3.5 ig:shrink-0" />
      )}
      <span className="ig:truncate">{children}</span>
      {showCount && <span className="ig:text-muted-foreground ig:tabular-nums">({row.getLeafRows().length})</span>}
    </span>
  );
}

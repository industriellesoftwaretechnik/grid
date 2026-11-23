import { FlexRender } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { gridMeta } from '#/core/gridMeta.ts';
import type { HeaderSlot } from '#/grid/header/headerRows.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { isExpandableGroup } from '#/logic/columns/columnInfo.ts';

/** The label of a column group's header, with its collapse toggle where it has columns shown only open or collapsed. */
export function ColumnGroupHeader<TData extends object>({ slot }: { slot: HeaderSlot<TData> }) {
  const { header, collapsed } = slot;
  const { table } = header.column;
  const t = useTranslate(table);
  const collapsible = useGridSelector(table, () =>
    isExpandableGroup(header.column, gridMeta(table).ownColumnVisibility)
  );
  const toggleLabel = collapsed ? t('group.expand') : t('group.collapse');

  return (
    <div className="ig:flex ig:h-full ig:items-center ig:gap-1 ig:px-2">
      <span className="ig:truncate">
        <FlexRender header={header} />
      </span>
      {collapsible && (
        <button
          type="button"
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          onClick={() => header.column.toggleCollapsed()}
          className="ig:flex ig:size-5 ig:items-center ig:justify-center ig:rounded-sm ig:text-muted-foreground ig:hover:bg-foreground/10 ig:hover:text-foreground ig:[&_svg]:size-3.5"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}
    </div>
  );
}

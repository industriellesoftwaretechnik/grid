import { ChevronsDownUp, ChevronsUpDown, X } from 'lucide-react';

import { gridMeta } from '#/core/gridMeta.ts';
import { useTableContext } from '#/core/tableContext.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { Badge } from '#/internal/components/badge.tsx';
import { Button } from '#/internal/components/button.tsx';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { expandParents } from '#/logic/expanding/expandParents.ts';

/**
 * The grouped columns, and buttons that open and close all groups or tree nodes; shown while there is something to
 * open or close. Place it inside the grid, such as in `DataGrid`'s `toolbar`.
 */
export function GroupingBar() {
  const table = useTableContext();
  const t = useTranslate(table);
  const { treeData, columns } = useGridSelector(table, () => ({
    treeData: gridMeta(table).treeData,
    columns: table.atoms.grouping.get().flatMap((columnId) => table.getColumn(columnId) ?? []),
  }));
  if (columns.length === 0 && !treeData) return null;

  return (
    <div className="ig:flex ig:items-center ig:gap-1.5 ig:text-xs">
      {columns.length > 0 && <span className="ig:text-muted-foreground">{t('grouped-by')}</span>}
      {columns.map((column) => (
        <Badge key={column.id} variant="secondary" className="ig:gap-1 ig:pr-0.5">
          {columnLabel(column)}
          <button
            type="button"
            aria-label={t('group.remove')}
            onClick={() => column.toggleGroupBy()}
            className="ig:rounded-sm ig:p-0.5 ig:hover:bg-muted-foreground/20"
          >
            <X className="ig:size-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={() => expandParents(table)}>
        <ChevronsUpDown />
        {t('rows.expand-all')}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => table.toggleAllRowsExpanded(false)}>
        <ChevronsDownUp />
        {t('rows.collapse-all')}
      </Button>
    </div>
  );
}

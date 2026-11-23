import { Eye, RotateCcw } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import { ColumnTree } from '#/grid/sidebar/ColumnTree.tsx';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { Button } from '#/internal/components/button.tsx';
import { setColumnsVisible } from '#/logic/state/visibility.ts';

/** Visibility and order of the columns as a tree, and resetting the layout. */
export function ColumnsPanel<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const t = useTranslate(table);
  const showAll = () =>
    setColumnsVisible(
      table,
      table
        .getAllLeafColumns()
        .filter((column) => column.getCanHide())
        .map((column) => column.id),
      true
    );

  return (
    <div className="ig:flex ig:flex-col ig:gap-1 ig:p-1">
      <div className="ig:flex ig:gap-1 ig:border-b ig:pb-1">
        <Button variant="ghost" size="sm" onClick={showAll}>
          <Eye />
          {t('columns.show-all')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => table.resetLayout()}>
          <RotateCcw />
          {t('columns.reset')}
        </Button>
      </div>
      <ColumnTree table={table} />
    </div>
  );
}

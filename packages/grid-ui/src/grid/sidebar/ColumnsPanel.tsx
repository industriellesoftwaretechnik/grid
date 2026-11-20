import { Eye, RotateCcw } from 'lucide-react';

import { ColumnTree } from '#/grid/sidebar/ColumnTree.tsx';
import { Button } from '#/internal/components/button.tsx';
import { useColumnsPanel, type GridInstance } from '@istec/grid-core';

/** Visibility and order of the columns as a tree, and resetting the layout. */
export function ColumnsPanel<TData extends object>({ table }: { table: GridInstance<TData> }) {
  const { showAll, reset } = useColumnsPanel(table);

  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="flex gap-1 border-b pb-1">
        <Button variant="ghost" size="sm" onClick={showAll.onClick}>
          <Eye />
          {showAll.label}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset.onClick}>
          <RotateCcw />
          {reset.label}
        </Button>
      </div>
      <ColumnTree table={table} />
    </div>
  );
}

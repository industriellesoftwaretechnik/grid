import { useState } from 'react';

import { Rows3 } from 'lucide-react';

import { Button } from '#/internal/components/button.tsx';
import { rowCountLabel, useGridTable } from '@istec/grid-core';

export interface GridPlaceholderProps<TData extends object> {
  data: TData[];
}

export function GridPlaceholder<TData extends object>({ data }: GridPlaceholderProps<TData>) {
  const table = useGridTable({ data, columns: [] });
  const [refreshes, setRefreshes] = useState(0);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm text-card-foreground">
      <Rows3 className="size-4 text-muted-foreground" aria-hidden />
      <span>{rowCountLabel(table.getRowModel().rows.length)}</span>
      <Button variant="outline" size="sm" onClick={() => setRefreshes((count) => count + 1)}>
        Refreshed {refreshes}×
      </Button>
    </div>
  );
}

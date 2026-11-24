import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useColumnWidths, type CoreTable } from '@istec/grid';

/** Header, body and footer are separate tables that share these column widths. */
export function ColumnTable<TData extends object>({
  table,
  className,
  style,
  children,
}: {
  table: CoreTable<TData>;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { width, columns } = useColumnWidths(table);

  return (
    <table
      className={cn('min-w-full table-fixed border-separate border-spacing-0', className)}
      style={{ width, ...style }}
    >
      <colgroup>
        {columns.map((column) =>
          column === 'filler' ? <col key="filler" /> : <col key={column.id} style={{ width: column.width }} />
        )}
      </colgroup>
      {children}
    </table>
  );
}

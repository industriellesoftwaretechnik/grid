import type { CSSProperties, ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import { columnLayout, type CoreTable } from '@istec/grid-core';

/** A `<table>` sized to the visible columns. Header, body and footer are separate ones that share these widths. */
export function ColumnTable<TData extends RowData>({
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
  return (
    <table
      className={cn('min-w-full table-fixed border-separate border-spacing-0', className)}
      style={{ width: table.getTotalSize(), ...style }}
    >
      <colgroup>
        {columnLayout(table).map((slot) =>
          slot === 'filler' ? (
            // A fixed-layout table spreads spare width over all columns unless one has no width; this one takes it.
            <col key="filler" />
          ) : (
            <col key={slot.item.id} style={{ width: slot.item.getSize() }} />
          )
        )}
      </colgroup>
      {children}
    </table>
  );
}

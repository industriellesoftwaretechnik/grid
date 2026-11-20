import { FlexRender, type RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import { RowToggle } from '#/grid/body/RowToggle.tsx';
import { focusOutlineClassName } from '#/grid/styles.ts';
import { groupingCell, useGroupRowCell, type GridRow } from '@istec/grid-core';

/** The cell of the group column, which holds the groups of every level. */
export function GroupColumnCell<TData extends RowData>({ row }: { row: GridRow<TData> }) {
  const cell = groupingCell(row);
  if (!cell) return null;
  return (
    <RowToggle row={row} level={row.depth} showCount>
      <FlexRender cell={cell} />
    </RowToggle>
  );
}

/** The full-width cell of a group row. */
export function GroupRowCell<TData extends RowData>({
  row,
  colSpan,
  stickyLeft,
}: {
  row: GridRow<TData>;
  colSpan: number;
  stickyLeft: number;
}) {
  const { cell, focused, label, cellProps } = useGroupRowCell(row);

  return (
    // Clipped rather than hidden: a hidden overflow would capture the sticky label below.
    <td
      {...cellProps}
      colSpan={colSpan}
      className={cn('overflow-clip px-2 align-middle whitespace-nowrap outline-none', focused && focusOutlineClassName)}
    >
      <div className="sticky w-fit" style={{ left: stickyLeft + 8 }}>
        {cell && (
          <RowToggle row={row} level={row.depth} showCount>
            <span className="font-normal text-muted-foreground">{label}: </span>
            <FlexRender cell={cell} />
          </RowToggle>
        )}
      </div>
    </td>
  );
}

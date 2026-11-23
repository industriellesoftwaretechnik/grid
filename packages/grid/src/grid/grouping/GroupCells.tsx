import { FlexRender, type RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import type { GridRow } from '#/core/types.ts';
import { RowToggle } from '#/grid/body/RowToggle.tsx';
import { useGroupRowCell } from '#/grid/body/useGroupRowCell.ts';
import { focusOutlineClassName } from '#/grid/styles.ts';

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
      className={cn(
        'ig:overflow-clip ig:px-2 ig:align-middle ig:whitespace-nowrap ig:outline-none',
        focused && focusOutlineClassName
      )}
    >
      <div className="ig:sticky ig:w-fit" style={{ left: stickyLeft + 8 }}>
        {cell && (
          <RowToggle row={row} level={row.depth} showCount>
            <span className="ig:font-normal ig:text-muted-foreground">{label}: </span>
            <FlexRender cell={cell} />
          </RowToggle>
        )}
      </div>
    </td>
  );
}

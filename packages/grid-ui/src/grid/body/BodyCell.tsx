import { FlexRender, type RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import { RowToggle } from '#/grid/body/RowToggle.tsx';
import { CellEditor } from '#/grid/editing/CellEditor.tsx';
import { focusOutlineClassName, pinnedClassName, rangeShadow, textAlign } from '#/grid/styles.ts';
import { useBodyCell, type BodyCellOptions, type GridCell } from '@istec/grid-core';

export function BodyCell<TData extends RowData>({
  cell,
  edge,
  ...options
}: BodyCellOptions<TData> & { cell: GridCell<TData>; edge: boolean }) {
  const { look, content, align, toggleLevel, className, cellProps, fillHandleProps } = useBodyCell(cell, options);
  const editing = content === 'editor';
  const { region } = options;

  return (
    <td
      {...cellProps}
      style={{ ...cellProps.style, boxShadow: rangeShadow(look) }}
      className={cn(
        'px-2 align-middle whitespace-nowrap outline-none',
        // Inside a range its border marks the selection; the focused cell adds no second outline.
        ((look.focused && !look.inRange) || editing) && focusOutlineClassName,
        editing ? 'relative p-0' : 'truncate',
        textAlign[align],
        pinnedClassName(region, edge),
        region !== 'center' &&
          'group-hover/row:bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))] group-data-[state=selected]/row:bg-muted',
        look.inRange && 'bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))]',
        look.fillHandle && region === 'center' && 'relative',
        className
      )}
    >
      {content === 'editor' ? (
        <CellEditor cell={cell} />
      ) : content === 'group' || content === 'toggle' ? (
        <RowToggle row={cell.row} level={toggleLevel} showCount={content === 'group'}>
          <FlexRender cell={cell} />
        </RowToggle>
      ) : content === 'empty' ? null : (
        <FlexRender cell={cell} />
      )}
      {look.fillHandle && !editing && (
        <span
          aria-hidden
          {...fillHandleProps}
          className="absolute right-0 bottom-0 hidden size-1.5 cursor-crosshair bg-primary group-focus-within/grid:block"
        />
      )}
    </td>
  );
}

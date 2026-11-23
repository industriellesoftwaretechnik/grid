import { FlexRender, type RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import type { GridCell } from '#/core/types.ts';
import { RowToggle } from '#/grid/body/RowToggle.tsx';
import { useBodyCell, type BodyCellOptions } from '#/grid/body/useBodyCell.ts';
import { CellEditor } from '#/grid/editing/CellEditor.tsx';
import { focusOutlineClassName, pinnedClassName, rangeShadow, textAlign } from '#/grid/styles.ts';

export function BodyCell<TData extends RowData>({
  cell,
  edge,
  ...options
}: BodyCellOptions<TData> & { cell: GridCell<TData>; edge: boolean }) {
  const { look, content, shownCell, align, toggleLevel, className, cellProps, fillHandleProps } = useBodyCell(
    cell,
    options
  );
  const editing = content === 'editor';
  const { region } = options;

  return (
    <td
      {...cellProps}
      style={{ ...cellProps.style, boxShadow: rangeShadow(look) }}
      className={cn(
        'ig:px-2 ig:align-middle ig:whitespace-nowrap ig:outline-none',
        // Inside a range its border marks the selection; the focused cell adds no second outline.
        ((look.focused && !look.inRange) || editing) && focusOutlineClassName,
        editing ? 'ig:relative ig:p-0' : 'ig:truncate',
        textAlign[align],
        pinnedClassName(region, edge),
        region !== 'center' &&
          'ig:group-hover/row:bg-[color-mix(in_oklab,--theme(--color-muted)_50%,--theme(--color-background))] ig:group-data-[state=selected]/row:bg-muted',
        look.inRange && 'ig:bg-[color-mix(in_oklab,--theme(--color-primary)_10%,--theme(--color-background))]',
        look.fillHandle && region === 'center' && 'ig:relative',
        className
      )}
    >
      {content === 'editor' ? (
        <CellEditor cell={cell} />
      ) : content === 'group' || content === 'toggle' ? (
        <RowToggle row={cell.row} level={toggleLevel} showCount={content === 'group'}>
          <FlexRender cell={shownCell} />
        </RowToggle>
      ) : content === 'empty' ? null : (
        <FlexRender cell={shownCell} />
      )}
      {look.fillHandle && !editing && (
        <span
          aria-hidden
          {...fillHandleProps}
          className="ig:absolute ig:right-0 ig:bottom-0 ig:hidden ig:size-1.5 ig:cursor-crosshair ig:bg-primary ig:group-focus-within/grid:block"
        />
      )}
    </td>
  );
}

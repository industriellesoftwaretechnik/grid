import type { ReactNode, Ref } from 'react';

import { FlexRender } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';

import { CellEditor } from '@/components/data-grid/cell-editor';
import { ColumnTable } from '@/components/data-grid/column-table';
import { AggregationMark } from '@/components/data-grid/footer';
import { messages } from '@/components/data-grid/messages';
import { focusOutlineClassName, pinnedClassName, rangeShadow, textAlign } from '@/components/data-grid/styles';
import { cn } from '@/lib/utils';
import {
  useBodyCell,
  useDataRow,
  useGroupRowCell,
  useRowToggle,
  useVirtualRows,
  type BodyCellOptions,
  type CoreTable,
  type GridCell,
  type GridRow,
  type RowOptions,
} from '@istec/grid';

export interface DataRowOptions<TData extends object> extends RowOptions<TData> {
  rowClassName?: (row: GridRow<TData>) => string | undefined;
}

export function VirtualRows<TData extends object>({
  table,
  scrollElement,
  overscan,
  noRows,
  ...rowOptions
}: DataRowOptions<TData> & {
  table: CoreTable<TData>;
  scrollElement: HTMLElement | null;
  overscan: number;
  noRows?: ReactNode;
}) {
  const { rows, paddingTop, paddingBottom, sticky, colSpan, viewportWidth, measureElement, empty } = useVirtualRows(
    table,
    { scrollElement, rowHeight: rowOptions.rowHeight, overscan }
  );

  if (empty) {
    return (
      <ColumnTable table={table}>
        <tbody>
          <tr>
            <td colSpan={colSpan} className="h-24 text-center text-muted-foreground">
              {noRows ?? messages.noRows}
            </td>
          </tr>
        </tbody>
      </ColumnTable>
    );
  }

  return (
    <>
      {sticky.length > 0 && (
        <div className="sticky top-0 z-10 h-0">
          {sticky.map(({ row, top, zIndex }) => (
            <ColumnTable key={row.id} table={table} className="absolute" style={{ top, zIndex }}>
              <tbody>
                <DataRow
                  row={row}
                  {...rowOptions}
                  rowClassName={(stuck) => cn('bg-background', rowOptions.rowClassName?.(stuck))}
                />
              </tbody>
            </ColumnTable>
          ))}
        </div>
      )}
      <ColumnTable table={table}>
        <tbody>
          {paddingTop > 0 && <tr aria-hidden style={{ height: paddingTop }} />}
          {rows.map((entry) =>
            entry.kind === 'detail' ? (
              <DetailRow
                key={entry.key}
                index={entry.index}
                measureRef={measureElement}
                colSpan={colSpan}
                width={viewportWidth}
              >
                {entry.detail}
              </DetailRow>
            ) : (
              <DataRow
                key={entry.key}
                row={entry.row}
                index={entry.index}
                measureRef={measureElement}
                {...rowOptions}
              />
            )
          )}
          {paddingBottom > 0 && <tr aria-hidden style={{ height: paddingBottom }} />}
        </tbody>
      </ColumnTable>
    </>
  );
}

export function DataRow<TData extends object>({
  row,
  index,
  measureRef,
  rowClassName,
  ...options
}: DataRowOptions<TData> & { row: GridRow<TData>; index?: number; measureRef?: Ref<HTMLTableRowElement> }) {
  const { grouped, clickable, cells, groupRow, groupToggles, rowProps } = useDataRow(row, {
    ...options,
    index,
    measureRef,
  });
  const events = { onCellClick: options.onCellClick, onCellDoubleClick: options.onCellDoubleClick };

  return (
    <tr
      {...rowProps}
      className={cn(
        'group/row transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted [&>td]:border-b',
        grouped && 'font-medium',
        clickable && 'cursor-pointer',
        rowClassName?.(row)
      )}
    >
      {groupRow ? (
        <>
          {groupRow.kept.map((slot) => (
            <BodyCell
              key={slot.item.id}
              cell={slot.item}
              region={slot.region}
              index={slot.index}
              edge={slot.edge}
              groupToggles={false}
            />
          ))}
          <GroupRowCell row={row} colSpan={groupRow.colSpan} stickyLeft={groupRow.stickyLeft} />
        </>
      ) : (
        cells?.map((slot) =>
          slot === 'filler' ? (
            <td key="filler" aria-hidden />
          ) : (
            <BodyCell
              key={slot.item.id}
              cell={slot.item}
              region={slot.region}
              index={slot.index}
              edge={slot.edge}
              groupToggles={groupToggles}
              {...events}
            />
          )
        )
      )}
    </tr>
  );
}

function BodyCell<TData extends object>({
  cell,
  edge,
  ...options
}: BodyCellOptions<TData> & { cell: GridCell<TData>; edge: boolean }) {
  const { look, content, shownCell, align, aggregation, toggleLevel, className, cellProps, fillHandleProps } =
    useBodyCell(cell, options);
  const editing = content === 'editor';
  const { region } = options;

  return (
    <td
      {...cellProps}
      style={{ ...cellProps.style, boxShadow: rangeShadow(look) }}
      className={cn(
        'px-2 align-middle whitespace-nowrap outline-none',
        ((look.focused && !look.inRange) || editing) && focusOutlineClassName,
        editing ? 'relative p-0' : 'truncate',
        textAlign[align],
        pinnedClassName(region, edge),
        region !== 'center' &&
          'group-hover/row:bg-[color-mix(in_oklab,--theme(--color-muted)_50%,--theme(--color-background))] group-data-[state=selected]/row:bg-muted',
        look.inRange && 'bg-[color-mix(in_oklab,--theme(--color-primary)_10%,--theme(--color-background))]',
        look.fillHandle && region === 'center' && 'relative',
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
        <>
          <AggregationMark aggregation={aggregation} />
          <FlexRender cell={shownCell} />
        </>
      )}
      {look.fillHandle && !editing && (
        <span
          {...fillHandleProps}
          className="absolute right-0 bottom-0 hidden size-1.5 cursor-crosshair bg-primary group-focus-within/grid:block"
        />
      )}
    </td>
  );
}

function RowToggle<TData extends object>({
  row,
  level,
  showCount = false,
  children,
}: {
  row: GridRow<TData>;
  level: number;
  showCount?: boolean;
  children: ReactNode;
}) {
  const toggle = useRowToggle(row);

  return (
    <span className="flex max-w-full items-center gap-1" style={{ paddingLeft: level * 16 }}>
      {toggle.canExpand ? (
        <button
          type="button"
          {...toggle.buttonProps}
          aria-label={toggle.expanded ? messages.collapse : messages.expand}
          className="-m-0.5 shrink-0 cursor-pointer rounded-sm p-0.5 hover:bg-muted-foreground/20"
        >
          <ChevronRight className={cn('size-3.5 transition-transform', toggle.expanded && 'rotate-90')} />
        </button>
      ) : (
        // Rows that cannot expand keep the toggle's space, so the content of a level lines up.
        <span aria-hidden className="size-3.5 shrink-0" />
      )}
      <span className="truncate">{children}</span>
      {showCount && <span className="text-muted-foreground tabular-nums">({toggle.count})</span>}
    </span>
  );
}

function DetailRow({
  index,
  measureRef,
  colSpan,
  width,
  children,
}: {
  index: number;
  measureRef: Ref<HTMLTableRowElement>;
  colSpan: number;
  width: number | undefined;
  children: ReactNode;
}) {
  return (
    <tr data-index={index} ref={measureRef} className="[&>td]:border-b">
      <td data-row-detail colSpan={colSpan} className="overflow-clip bg-muted/30 p-0">
        <div className="sticky left-0 p-3 whitespace-normal" style={{ width }}>
          {children}
        </div>
      </td>
    </tr>
  );
}

function GroupRowCell<TData extends object>({
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

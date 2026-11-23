import type { Ref } from 'react';

import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import type { GridRow } from '#/core/types.ts';
import { BodyCell } from '#/grid/body/BodyCell.tsx';
import { useDataRow, type RowOptions } from '#/grid/body/useDataRow.ts';
import { GroupRowCell } from '#/grid/grouping/GroupCells.tsx';

export interface DataRowOptions<TData extends RowData> extends RowOptions<TData> {
  rowClassName?: (row: GridRow<TData>) => string | undefined;
}

export function DataRow<TData extends RowData>({
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
        'ig:group/row ig:transition-colors ig:hover:bg-muted/50 ig:data-[state=selected]:bg-muted ig:[&>td]:border-b',
        grouped && 'ig:font-medium',
        clickable && 'ig:cursor-pointer',
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

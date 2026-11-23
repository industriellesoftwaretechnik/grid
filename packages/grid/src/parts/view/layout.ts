import type { CSSProperties } from 'react';

import type { HeaderGroup, RowData } from '@tanstack/react-table';

import type { CoreTable, GridFeatures, GridHeader } from '#/core/table/types.ts';

declare module 'react' {
  interface CSSProperties {
    [variable: `--${string}`]: string | number | undefined;
  }
}

export type Region = 'start' | 'center' | 'end';

export interface Placed<T> {
  item: T;
  region: Region;
  index: number;
  edge: boolean;
}

// The filler sits between center and end, so end-pinned columns stay at the right edge.
export type LayoutSlot<T> = Placed<T> | 'filler';

/** The items of the three regions in display order, with the filler between center and end. */
export function placeSlots<T>(start: T[], center: T[], end: T[]): LayoutSlot<T>[] {
  return [
    ...start.map((item, index) => ({ item, region: 'start' as const, index, edge: index === start.length - 1 })),
    ...center.map((item, index) => ({ item, region: 'center' as const, index, edge: false })),
    'filler',
    ...end.map((item, index) => ({ item, region: 'end' as const, index, edge: index === 0 })),
  ];
}

export function columnLayout<TData extends RowData>(table: CoreTable<TData>) {
  return placeSlots(
    table.getStartVisibleLeafColumns(),
    table.getCenterVisibleLeafColumns(),
    table.getEndVisibleLeafColumns()
  );
}

export function headerLayout<TData extends RowData>(table: CoreTable<TData>) {
  const start = table.getStartHeaderGroups();
  const center = table.getCenterHeaderGroups();
  const end = table.getEndHeaderGroups();
  return center.map((group: HeaderGroup<GridFeatures, TData>, depth) => ({
    id: group.id,
    slots: placeSlots(start[depth]?.headers ?? [], group.headers, end[depth]?.headers ?? []),
  }));
}

// Body cells read their sticky offsets from these variables, so a column resize does not re-render any row.
export function pinnedOffsetVariables<TData extends RowData>(table: CoreTable<TData>): CSSProperties {
  const variables: CSSProperties = {};
  table.getStartVisibleLeafColumns().forEach((column, index) => {
    variables[`--pin-start-${index}`] = `${column.getStart('start')}px`;
  });
  table.getEndVisibleLeafColumns().forEach((column, index) => {
    variables[`--pin-end-${index}`] = `${column.getAfter('end')}px`;
  });
  return variables;
}

export function cellStickyStyle(region: Region, index: number): CSSProperties | undefined {
  if (region === 'start') return { position: 'sticky', left: `var(--pin-start-${index})`, zIndex: 1 };
  if (region === 'end') return { position: 'sticky', right: `var(--pin-end-${index})`, zIndex: 1 };
  return undefined;
}

export function headerStickyStyle<TData extends RowData>(
  header: GridHeader<TData>,
  region: Region
): CSSProperties | undefined {
  if (region === 'start') return { position: 'sticky', left: header.getStart('start'), zIndex: 2 };
  if (region === 'end') {
    const right = header.getContext().table.getEndTotalSize() - header.getStart('end') - header.getSize();
    return { position: 'sticky', right, zIndex: 2 };
  }
  return undefined;
}

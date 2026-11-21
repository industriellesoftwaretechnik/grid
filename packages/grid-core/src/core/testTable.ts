import { constructTable, type RowData } from '@tanstack/react-table';
import { vi } from 'vite-plus/test';

import type { GridComponents } from '#/core/components.ts';
import type { GridMeta } from '#/core/gridMeta.ts';
import { testFeatures } from '#/core/testFeatures.ts';
import type { GridColumnDef } from '#/core/types.ts';
import { createTranslate } from '#/locale/messages.ts';

const noComponents: GridComponents = {
  AggregatedCell: () => null,
  SelectAllCheckbox: () => null,
  RowCheckbox: () => null,
};

/** A table without React, with the meta `useGrid` would give it; its actions are spies. */
export function testTable<TData extends RowData>({
  columns,
  data,
  meta,
  getRowId,
}: {
  columns: GridColumnDef<TData>[];
  data: TData[];
  meta?: Partial<GridMeta>;
  getRowId?: (row: TData) => string;
}) {
  const fullMeta: GridMeta = {
    tableId: 'test',
    t: createTranslate(),
    components: noComponents,
    groupDisplay: 'columns',
    treeData: false,
    expandColumn: undefined,
    renderDetail: undefined,
    extraState: { columnAggregation: {}, collapsedColumnGroups: {} },
    ownColumnVisibility: {},
    server: undefined,
    toggleRowGrouping: vi.fn<GridMeta['toggleRowGrouping']>(),
    setColumnAggregation: vi.fn<GridMeta['setColumnAggregation']>(),
    toggleColumnGroup: vi.fn<GridMeta['toggleColumnGroup']>(),
    setColumnsVisible: vi.fn<GridMeta['setColumnsVisible']>(),
    resetLayout: vi.fn<GridMeta['resetLayout']>(),
    ...meta,
  };
  return constructTable({ features: testFeatures, columns, data, meta: fullMeta, getRowId });
}

import { constructTable, type RowData } from '@tanstack/react-table';

import type { GroupDisplay } from '#/core/plugins/gridLayoutFeature.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';
import { testFeatures } from '#/core/table/testFeatures.ts';
import type { GridColumnDef } from '#/core/table/types.ts';

/** English unless `meta.locale` says otherwise. */
export function testTable<TData extends RowData>({
  columns,
  data,
  meta,
  getRowId,
  groupDisplay = 'columns',
}: {
  columns: GridColumnDef<TData>[];
  data: TData[];
  meta?: Partial<GridMeta>;
  getRowId?: (row: TData) => string;
  groupDisplay?: GroupDisplay;
}) {
  const fullMeta: GridMeta = {
    tableId: 'test',
    locale: 'en-US',
    treeData: false,
    expandColumn: undefined,
    renderDetail: undefined,
    ownColumnVisibility: {},
    ...meta,
  };
  return constructTable({
    features: testFeatures,
    columns,
    data,
    meta: fullMeta,
    getRowId,
    groupDisplay,
  });
}

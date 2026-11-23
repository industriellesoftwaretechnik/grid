import { constructTable, type RowData } from '@tanstack/react-table';

import { createTranslate } from '#/core/locale/messages.ts';
import type { GroupDisplay } from '#/core/plugins/gridLayoutFeature.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';
import { testFeatures } from '#/core/table/testFeatures.ts';
import type { GridColumnDef } from '#/core/table/types.ts';

/** A table without React, with the meta `useGrid` would give it. */
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
    t: createTranslate(),
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

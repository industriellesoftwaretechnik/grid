import { constructTable, type RowData } from '@tanstack/react-table';

import type { GridMeta } from '#/core/gridMeta.ts';
import { testFeatures } from '#/core/testFeatures.ts';
import type { GridColumnDef } from '#/core/types.ts';
import { createTranslate } from '#/locale/messages.ts';
import type { GroupDisplay } from '#/plugins/gridLayoutFeature.ts';

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
    server: undefined,
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

import {
  cellSelectionFeature,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

import type { GridMeta } from '#/core/gridMeta.ts';
import type { GridColumnMeta } from '#/logic/columns/columnMeta.ts';
import { filterFns } from '#/logic/filters/filterFns.ts';
import { aggregationFns } from '#/logic/grouping/aggregations.ts';
import { cellEditingFeature } from '#/plugins/cellEditingFeature.ts';
import { columnAggregationFeature } from '#/plugins/columnAggregationFeature.ts';
import { columnGroupCollapseFeature } from '#/plugins/columnGroupCollapseFeature.ts';
import { gridLayoutFeature } from '#/plugins/gridLayoutFeature.ts';
import { gridStoreFeature } from '#/plugins/gridStoreFeature.ts';

const columnMeta: GridColumnMeta = {};
const tableMeta = {} as GridMeta;

export const features = tableFeatures({
  columnSizingFeature,
  columnResizingFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  columnPinningFeature,
  columnFilteringFeature,
  columnFacetingFeature,
  globalFilteringFeature,
  rowSortingFeature,
  columnGroupingFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPinningFeature,
  rowSelectionFeature,
  cellSelectionFeature,
  cellEditingFeature,
  columnAggregationFeature,
  columnGroupCollapseFeature,
  gridLayoutFeature,
  gridStoreFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  filterFns,
  // The names `sortFn: 'auto'` resolves to; it falls back to basic, which needs no registration.
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime },
  aggregationFns,
  columnMeta,
  tableMeta,
});

export type GridFeatures = typeof features;

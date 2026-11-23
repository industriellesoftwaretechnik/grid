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

import type { GridColumnMeta } from '#/core/columns/columnMeta.ts';
import { cellEditingFeature } from '#/core/plugins/cellEditingFeature.ts';
import { columnAggregationFeature } from '#/core/plugins/columnAggregationFeature.ts';
import { gridLayoutFeature } from '#/core/plugins/gridLayoutFeature.ts';
import { gridStoreFeature } from '#/core/plugins/gridStoreFeature.ts';
import { aggregationFns } from '#/core/table/aggregations.ts';
import { filterFns } from '#/core/table/filterFns.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';

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

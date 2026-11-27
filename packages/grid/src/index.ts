// core/table/
export { useGrid, type GridOptions } from '#/core/table/useGrid.ts';
export { createGridColumnHelper, type GridInstance } from '#/core/table/tableHook.ts';
export { useGridContext } from '#/core/table/tableContext.ts';
export { useGridSelector } from '#/core/table/useGridSelector.ts';
export { useFormatNumber } from '#/core/table/useFormatNumber.ts';
export { gridMeta, type GridMeta } from '#/core/table/gridMeta.ts';
export { gridDefaults } from '#/core/table/defaults.ts';
export { persistedSlices } from '#/core/table/persistence.ts';
export type {
  CoreTable,
  GridCell,
  GridColumn,
  GridColumnDef,
  GridFeatures,
  GridHeader,
  GridRow,
  GridState,
} from '#/core/table/types.ts';

// core/plugins/
export type { GridLayout, GroupDisplay } from '#/core/plugins/gridLayoutFeature.ts';
export type { ColumnAggregationState } from '#/core/plugins/columnAggregationFeature.ts';
export type {
  CellValueChange,
  CellValueInput,
  CellValueRejection,
  EditingCellState,
} from '#/core/plugins/cellEditingFeature.ts';

// core/columns/
export {
  dataTypeDefaults,
  type CellEditorProps,
  type CellRule,
  type ColumnAlign,
  type DataType,
  type FilterKind,
  type GridColumnMeta,
} from '#/core/columns/columnMeta.ts';
export { columnLabel, columnMeta } from '#/core/columns/columnInfo.ts';
export { formatAggregate, formatNumber, formatValue } from '#/core/columns/format.ts';
export { groupColumnId } from '#/core/columns/groupColumn.ts';
export type { AggregationName } from '#/core/table/aggregations.ts';

// core/shared/
export type { GridMenuEntry, GridMenuId, GridMenuItem, GridMenuSection, GridSubmenu } from '#/core/shared/menu.ts';

// parts/view/
export { useGridView, type GridViewModel, type GridViewOptions } from '#/parts/view/useGridView.ts';
export { useColumnWidths, type ColumnWidth, type ColumnWidths } from '#/parts/view/useColumnWidths.ts';
export { useVirtualList, type VirtualListModel } from '#/parts/view/useVirtualList.ts';
export type { Region } from '#/parts/view/layout.ts';

// parts/header/
export { useHeaderRows, type HeaderRow, type HeaderSlot } from '#/parts/header/headerRows.ts';
export { useHeaderCell, type HeaderCellModel } from '#/parts/header/useHeaderCell.ts';
export { useColumnResizer, type ColumnResizerModel } from '#/parts/header/useColumnResizer.ts';
export { useColumnReorder, type ColumnReorderModel } from '#/parts/header/useColumnReorder.ts';
export { useColumnMenu } from '#/parts/header/useColumnMenu.ts';
export type { ColumnMenuOptions } from '#/parts/header/columnMenu.ts';

// parts/body/
export { useVirtualRows, type VirtualRow, type VirtualRowsModel } from '#/parts/body/useVirtualRows.ts';
export { useDataRow, type DataRowModel, type RowOptions } from '#/parts/body/useDataRow.ts';
export {
  useBodyCell,
  type BodyCellContent,
  type BodyCellModel,
  type BodyCellOptions,
  type CellEvents,
  type CellLook,
} from '#/parts/body/useBodyCell.ts';
export { useGroupRowCell, type GroupRowCellModel } from '#/parts/body/useGroupRowCell.ts';
export { useRowToggle, type RowToggleModel } from '#/parts/body/useRowToggle.ts';
export { useCellMenu, type CellMenuModel } from '#/parts/body/cellMenu.ts';

// parts/editing/
export {
  useCellEditor,
  type CellEditorError,
  type CellEditorModel,
  type EditorChoice,
} from '#/parts/editing/useCellEditor.ts';
export type { EditorKind } from '#/core/columns/editorValue.ts';

// selection
export { useSelectAll, useRowSelect, type SelectionCheckboxModel } from '#/parts/selection/useRowSelection.ts';
export type { CellPosition } from '#/core/selection/cellRanges.ts';
export { copyText, pasteText } from '#/core/selection/clipboard.ts';

// parts/filters/
export { useFilterInput, useSearch, type DraftInput } from '#/parts/filters/useDraftInput.ts';
export {
  boundsCodec,
  numberRangeCodec,
  parseNumberRange,
  textCodec,
  type InputCodec,
  type NumberRange,
} from '#/parts/filters/inputCodecs.ts';
export { useFloatingFilter, type FloatingFilterModel } from '#/parts/filters/useFloatingFilter.ts';
export {
  useRangeFilter,
  useSetFilter,
  type RangeFilterModel,
  type SetFilterModel,
} from '#/parts/filters/useFilterEditors.ts';
export { columnFilterSummary, filterSummary, type FilterSummary } from '#/parts/filters/filterSummary.ts';
export type { SetFilterOption } from '#/parts/filters/setFilter.ts';

// parts/grouping/
export { useGroupPanel, type GroupChip } from '#/parts/grouping/useGroupPanel.ts';

// parts/footer/
export { useTotalsRow, type AggregatedValue, type TotalsCell } from '#/parts/footer/totalsRow.ts';
export { gridStatus, type GridStatus } from '#/parts/footer/statusBar.ts';
export { useStatusBar } from '#/parts/footer/useStatusBar.ts';

// parts/toolbar/
export { downloadCsv, tableCsv, type CsvExportOptions } from '#/parts/toolbar/csvExport.ts';
export { useColumnsMenu } from '#/parts/toolbar/useColumnsMenu.ts';
export type { GridActionsTable } from '#/core/plugins/gridActionsFeature.ts';

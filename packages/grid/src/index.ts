// The table
export { useGrid, type GridOptions } from '#/hooks/useGrid.ts';
export { createGridColumnHelper, type GridInstance } from '#/core/tableHook.tsx';
export { useTableContext as useGridContext } from '#/core/tableContext.ts';
export type { GridLayout, GroupDisplay } from '#/plugins/gridLayoutFeature.ts';
export type { ColumnAggregationState } from '#/plugins/columnAggregationFeature.ts';
export type { CollapsedColumnGroupsState } from '#/plugins/columnGroupCollapseFeature.ts';
export type {
  CoreTable,
  GridCell,
  GridColumn,
  GridColumnDef,
  GridFeatures,
  GridHeader,
  GridRow,
  GridState,
} from '#/core/types.ts';
export { gridDefaults } from '#/defaults.ts';
export { selectionColumn } from '#/columns/selectionColumn.tsx';
export { persistedSlices } from '#/logic/state/persistence.ts';

// Columns
export {
  dataTypeDefaults,
  type CellEditorProps,
  type CellRule,
  type ColumnAlign,
  type DataType,
  type FilterKind,
  type GridColumnMeta,
} from '#/logic/columns/columnMeta.ts';
export { columnLabel, columnMeta } from '#/logic/columns/columnInfo.ts';
export type { AggregationName } from '#/logic/grouping/aggregations.ts';
export { formatAggregate, formatValue } from '#/logic/format.ts';

// Texts
export { createTranslate, type GridMessageKey, type GridMessages, type Translate } from '#/locale/messages.ts';
export { default as gridMessagesEn } from '#/locale/en.ts';
export { default as gridMessagesDe } from '#/locale/de.ts';

// Server rows
export type {
  FetchRows,
  ServerFilter,
  ServerQuery,
  ServerRowsPage,
  ServerRowsRequest,
} from '#/logic/server/serverRequest.ts';
export type { ServerRows, ServerRowsStatus } from '#/hooks/useServerRows.ts';

// Editing, clipboard and export
export type {
  CellValueChange,
  CellValueInput,
  CellValueRejection,
  EditingCellState,
} from '#/plugins/cellEditingFeature.ts';
export type { CellPosition } from '#/logic/selection/cellRanges.ts';
export type { EditorKind } from '#/logic/editing/editorValue.ts';
export { downloadCsv, tableCsv, type CsvExportOptions } from '#/logic/export/csvExport.ts';
export { copyText, pasteText } from '#/logic/clipboard/clipboard.ts';

// Items the host adds to the cell menu.
export type { CellMenuItem, CellMenuItems } from '#/grid/body/cellMenu.ts';

// Components of the host that read the table subscribe through this.
export { useGridSelector } from '#/hooks/useGridSelector.ts';

// Rendering
export { DataGrid, type DataGridProps } from '#/grid/DataGrid.tsx';
export { StatusBar } from '#/grid/footer/StatusBar.tsx';
export { ExportButton } from '#/grid/toolbar/ExportButton.tsx';
export { GroupingBar } from '#/grid/toolbar/GroupingBar.tsx';
export { SearchInput } from '#/grid/toolbar/SearchInput.tsx';

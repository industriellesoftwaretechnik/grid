// The public API, one section per folder: core/ is what every part builds on, parts/ has a folder per part a UI renders. Every hook takes the table from `useGrid` (or a row, column, cell or header
// of it) and returns a model: values to show, actions to call and props for the UI's elements.

// core/table/: creating the table and subscribing to it
export { useGrid, type GridOptions } from '#/core/table/useGrid.ts';
export { createGridColumnHelper, type GridInstance } from '#/core/table/tableHook.ts';
export { useTableContext as useGridContext } from '#/core/table/tableContext.ts';
export { useGridSelector } from '#/core/table/useGridSelector.ts';
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

// core/plugins/: the grid's state and actions on the table, beyond TanStack's
export type { GridLayout, GroupDisplay } from '#/core/plugins/gridLayoutFeature.ts';
export type { ColumnAggregationState } from '#/core/plugins/columnAggregationFeature.ts';
export type {
  CellValueChange,
  CellValueInput,
  CellValueRejection,
  EditingCellState,
} from '#/core/plugins/cellEditingFeature.ts';

// core/locale/
export { createTranslate, type GridMessageKey, type GridMessages, type Translate } from '#/core/locale/messages.ts';
export { useTranslate } from '#/core/locale/useTranslate.ts';
export { default as gridMessagesEn } from '#/core/locale/en.ts';
export { default as gridMessagesDe } from '#/core/locale/de.ts';

// core/columns/: column settings and how values show
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
export { formatAggregate, formatValue } from '#/core/columns/format.ts';
export type { AggregationName } from '#/core/table/aggregations.ts';

// core/shared/: menus as data
export type { GridMenuEntry, GridMenuIcon, GridMenuItem, GridMenuSection, GridSubmenu } from '#/core/shared/menu.ts';

// parts/view/: the frame, with header, body and footer as tables sharing the column widths
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
export { useCellMenu, type CellMenuItem, type CellMenuItems } from '#/parts/body/cellMenu.ts';

// parts/editing/
export { useCellEditor, type CellEditorModel, type EditorChoice } from '#/parts/editing/useCellEditor.ts';
export type { EditorKind } from '#/core/columns/editorValue.ts';

// core/selection/ and parts/selection/: rows, cell ranges and the clipboard
export { useSelectAll, useRowSelect, type SelectionCheckboxModel } from '#/parts/selection/useRowSelection.ts';
export type { CellPosition } from '#/core/selection/cellRanges.ts';
export { copyText, pasteText } from '#/core/selection/clipboard.ts';

// parts/filters/
export { useFloatingFilter, type FloatingFilterModel } from '#/parts/filters/useFloatingFilter.ts';
export {
  useRangeFilter,
  useSetFilter,
  useTextFilter,
  type RangeFilterModel,
  type SetFilterModel,
  type TextFilterModel,
} from '#/parts/filters/useFilterEditors.ts';
export type { SetFilterOption } from '#/parts/filters/setFilter.ts';

// parts/grouping/
export { useGroupPanel, type GroupChip, type GroupPanelModel } from '#/parts/grouping/useGroupPanel.ts';

// parts/footer/
export { useTotalsRow, type AggregationMark, type TotalsCell } from '#/parts/footer/totalsRow.ts';
export { useStatusBar, type StatusBarModel } from '#/parts/footer/useStatusBar.ts';

// parts/toolbar/
export { useSearch, type SearchModel } from '#/parts/toolbar/useSearch.ts';
export { useExport, type ExportModel } from '#/parts/toolbar/useExport.ts';
export { downloadCsv, tableCsv, type CsvExportOptions } from '#/parts/toolbar/csvExport.ts';
export { useExpandAll, type ExpandAllModel } from '#/parts/toolbar/useExpandAll.ts';
export { useClearFilters, type ClearFiltersModel } from '#/parts/toolbar/useClearFilters.ts';
export { useColumnsMenu } from '#/parts/toolbar/useColumnsMenu.ts';

// The table
export { useGrid, type GridOptions, type UseGridOptions } from '#/hooks/useGrid.ts';
export { createGridColumnHelper, type GridInstance } from '#/core/tableHook.tsx';
export { useTableContext as useGridContext } from '#/core/tableContext.ts';
export { gridMeta, type GridExtraState, type GridMeta, type GroupDisplay } from '#/core/gridMeta.ts';
export type { GridComponents } from '#/core/components.ts';
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

// Headless: what a UI layer renders the grid with. Layout helpers place columns in their pinned regions.
export { columnLayout, type LayoutSlot, type Placed, type Region } from '#/logic/layout.ts';
export type { MenuChoice, MenuEntry, MenuIcon, MenuItem, MenuSection } from '#/headless/menu.ts';
export { useGridSelector } from '#/headless/useGridSelector.ts';
export { useGridView, type GridViewOptions } from '#/headless/grid/useGridView.ts';
export { useVirtualRows, type VirtualRow, type VirtualRowsOptions } from '#/headless/body/useVirtualRows.ts';
export { useDataRow, type FullWidthGroup, type RowOptions } from '#/headless/body/useDataRow.ts';
export {
  useBodyCell,
  type BodyCellContent,
  type BodyCellOptions,
  type CellEvents,
  type CellLook,
} from '#/headless/body/useBodyCell.ts';
export { useRowToggle } from '#/headless/body/useRowToggle.ts';
export { groupingCell, useGroupRowCell } from '#/headless/body/useGroupRowCell.ts';
export { cellMenu, type CellMenuItem, type CellMenuItems } from '#/headless/body/cellMenu.ts';
export { useCellEditor, type EditorChoice } from '#/headless/editing/useCellEditor.ts';
export { headerRows, type HeaderSlot } from '#/headless/header/headerRows.ts';
export { useColumnGroupHeader, useHeaderCell } from '#/headless/header/useHeaderCell.ts';
export { useColumnResizer } from '#/headless/header/useColumnResizer.ts';
export { columnMenu, type ColumnMenuOptions } from '#/headless/header/columnMenu.ts';
export { useColumnMenu } from '#/headless/header/useColumnMenu.ts';
export { ColumnReorder, type DropAction } from '#/headless/header/ColumnReorder.tsx';
export { useFilterValue } from '#/headless/filters/useFilterValue.ts';
export { useRangeFilter, useSetFilter, useTextFilter } from '#/headless/filters/useFilterEditors.ts';
export { setFilter, type CheckState, type SetFilterOption } from '#/headless/filters/setFilter.ts';
export { useColumnFilterButton, useFloatingFilter } from '#/headless/filters/useFilterTriggers.ts';
export { useVirtualList } from '#/headless/filters/useVirtualList.ts';
export { useGroupPanel } from '#/headless/grouping/useGroupPanel.ts';
export { GroupChipList, type GroupChip } from '#/headless/grouping/GroupChipList.tsx';
export { useGroupChip } from '#/headless/grouping/useGroupChip.ts';
export {
  aggregatedValue,
  aggregationMark,
  totalsRow,
  type AggregationMark,
  type TotalsCell,
} from '#/headless/footer/totalsRow.ts';
export { cellSummary, rowCounts, selectedRows } from '#/headless/footer/statusBar.ts';
export { useStatusBar } from '#/headless/footer/useStatusBar.ts';
export { useRowCheckbox, useSelectAllCheckbox } from '#/headless/selection/useSelectionCheckboxes.ts';
export { useColumnsPanel, useSideBar, type SideBarPanel } from '#/headless/sidebar/useSideBar.ts';
export { ColumnTree, ColumnTreeLevel, type ColumnNode } from '#/headless/sidebar/ColumnTree.tsx';
export { useColumnTreeNode } from '#/headless/sidebar/useColumnTreeNode.ts';
export { useFiltersPanel } from '#/headless/sidebar/useFiltersPanel.ts';
export { useExportButton, useGroupingBar, useSearchInput } from '#/headless/toolbar/useToolbar.ts';

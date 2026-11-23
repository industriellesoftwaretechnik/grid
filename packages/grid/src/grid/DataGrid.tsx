import type { ReactNode } from 'react';

import { cn } from 'cn';
import { LoaderCircle } from 'lucide-react';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridInstance } from '#/core/tableHook.tsx';
import { gridDefaults } from '#/defaults.ts';
import type { CellMenuItems } from '#/grid/body/cellMenu.ts';
import { CellMenu } from '#/grid/body/CellMenu.tsx';
import { DataRow, type DataRowOptions } from '#/grid/body/DataRow.tsx';
import { VirtualRows } from '#/grid/body/VirtualRows.tsx';
import { ColumnTable } from '#/grid/ColumnTable.tsx';
import { FloatingFilterRow } from '#/grid/filters/FloatingFilterRow.tsx';
import { StatusBar } from '#/grid/footer/StatusBar.tsx';
import { TotalsRow } from '#/grid/footer/TotalsRow.tsx';
import { GroupPanel } from '#/grid/grouping/GroupPanel.tsx';
import { ColumnReorder } from '#/grid/header/ColumnReorder.tsx';
import { HeaderRows } from '#/grid/header/HeaderRows.tsx';
import { SideBar } from '#/grid/sidebar/SideBar.tsx';
import { ExportButton } from '#/grid/toolbar/ExportButton.tsx';
import { GroupingBar } from '#/grid/toolbar/GroupingBar.tsx';
import { SearchInput } from '#/grid/toolbar/SearchInput.tsx';
import { useGridView } from '#/grid/useGridView.ts';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '#/internal/components/context-menu.tsx';

export interface DataGridProps<TData extends object> extends Omit<DataRowOptions<TData>, 'rowHeight'> {
  table: GridInstance<TData>;
  /** Replaces the default toolbar of `GroupingBar`, `ExportButton` and `SearchInput`, which it can contain. */
  toolbar?: ReactNode;
  headerHeight?: number;
  rowHeight?: number;
  /** Rows rendered beyond each edge of the viewport. */
  overscan?: number;
  /** Shown instead of the rows when none pass the filters. */
  noRows?: ReactNode;
  /** Covers the rows with a spinner, such as while they are fetched. Rows from `fetchRows` do this themselves. */
  loading?: boolean;
  /** Adds a footer row with the totals of the aggregated columns. */
  showTotals?: boolean;
  /** Shows the row above the header that columns are dragged into to group by them. */
  showGroupPanel?: boolean;
  /** Shows a row under the header with a filter per column. */
  showFloatingFilters?: boolean;
  /** Shows the tabs at the right edge that open the columns and the filters. */
  showSideBar?: boolean;
  /** Shows the footer with the row counts. */
  showStatusBar?: boolean;
  /** Shown at the end of the status bar. */
  statusBar?: ReactNode;
  /** Items added below copy and paste in a cell's context menu. */
  cellMenuItems?: CellMenuItems<TData>;
  /** The file name of the CSV export, without extension. Defaults to the table's `id`. */
  exportFileName?: string;
  className?: string;
}

export function DataGrid<TData extends object>({
  table,
  toolbar,
  headerHeight = gridDefaults.headerHeight,
  rowHeight = gridDefaults.rowHeight,
  overscan = gridDefaults.overscan,
  noRows,
  loading,
  showTotals = gridDefaults.showTotals,
  showGroupPanel = gridDefaults.showGroupPanel,
  showFloatingFilters = gridDefaults.showFloatingFilters,
  showSideBar = gridDefaults.showSideBar,
  showStatusBar = gridDefaults.showStatusBar,
  statusBar,
  cellMenuItems,
  exportFileName,
  className,
  ...rowEvents
}: DataGridProps<TData>) {
  const view = useGridView(table, { rowHeight, loading, showTotals, showGroupPanel });
  const rowOptions: DataRowOptions<TData> = { rowHeight, ...rowEvents };

  return (
    <table.AppTable>
      <div className={cn('ig:flex ig:min-h-0 ig:flex-1 ig:flex-col ig:gap-3', className)}>
        <div className="ig:flex ig:flex-wrap ig:items-center ig:gap-2">
          {toolbar ?? (
            <>
              {!view.groupPanel && <GroupingBar />}
              <div className="ig:ml-auto ig:flex ig:items-center ig:gap-2">
                <ExportButton fileName={exportFileName} />
                <SearchInput />
              </div>
            </>
          )}
        </div>
        <div className="ig:flex ig:min-h-0 ig:flex-1 ig:flex-col ig:overflow-hidden ig:rounded-md ig:border ig:text-xs">
          <ColumnReorder table={table}>
            {view.groupPanel && <GroupPanel table={table} />}
            <div className="ig:flex ig:min-h-0 ig:flex-1">
              <div
                {...view.gridProps}
                className="ig:group/grid ig:relative ig:flex ig:min-w-0 ig:flex-1 ig:flex-col ig:overflow-hidden ig:[--range-edge:color-mix(in_oklab,--theme(--color-primary)_40%,transparent)] ig:focus-within:[--range-edge:--theme(--color-primary)]"
              >
                <div
                  {...view.headerProps}
                  className="ig:scrollbar-gutter-stable ig:overflow-hidden ig:border-b ig:bg-muted ig:select-none"
                >
                  <ColumnTable table={table}>
                    <thead>
                      <HeaderRows table={table} headerHeight={headerHeight} />
                      {showFloatingFilters && <FloatingFilterRow table={table} height={rowHeight} />}
                    </thead>
                    {view.topRows.length > 0 && (
                      <tbody className="ig:bg-background ig:[&>tr:first-child>td]:border-t ig:[&>tr:last-child>td]:border-b-0">
                        {view.topRows.map((row) => (
                          <DataRow key={row.id} row={row} {...rowOptions} />
                        ))}
                      </tbody>
                    )}
                  </ColumnTable>
                </div>
                <ContextMenu>
                  <ContextMenuTrigger
                    {...view.scrollProps}
                    className="ig:min-h-0 ig:flex-1 ig:scrollbar-gutter-stable ig:overflow-auto ig:outline-none"
                  >
                    <VirtualRows
                      table={table}
                      scrollElement={view.scrollElement}
                      overscan={overscan}
                      noRows={noRows}
                      {...rowOptions}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent className="ig:w-56">
                    <CellMenu table={table} items={cellMenuItems} />
                  </ContextMenuContent>
                </ContextMenu>
                {(view.bottomRows.length > 0 || view.totals) && (
                  <div {...view.footerProps} className="ig:scrollbar-gutter-stable ig:overflow-hidden ig:border-t">
                    <ColumnTable table={table}>
                      <tbody className="ig:[&>tr:last-child>td]:border-b-0">
                        {view.bottomRows.map((row) => (
                          <DataRow key={row.id} row={row} {...rowOptions} />
                        ))}
                        {view.totals && <TotalsRow table={table} rowHeight={rowHeight} />}
                      </tbody>
                    </ColumnTable>
                  </div>
                )}
                {view.busy && (
                  <div className="ig:absolute ig:inset-0 ig:z-30 ig:flex ig:items-center ig:justify-center ig:gap-2 ig:bg-background/60 ig:text-muted-foreground">
                    <LoaderCircle className="ig:size-4 ig:animate-spin" />
                    {gridMeta(table).t('loading')}
                  </div>
                )}
              </div>
              {showSideBar && <SideBar table={table} />}
            </div>
          </ColumnReorder>
          {showStatusBar && <StatusBar table={table}>{statusBar}</StatusBar>}
        </div>
      </div>
    </table.AppTable>
  );
}

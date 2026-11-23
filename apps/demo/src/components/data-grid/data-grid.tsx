import type { ReactNode } from 'react';

import { LoaderCircle } from 'lucide-react';

import { DataRow, VirtualRows, type DataRowOptions } from '@/components/data-grid/body';
import { ColumnReorder } from '@/components/data-grid/column-reorder';
import { ColumnTable } from '@/components/data-grid/column-table';
import { FloatingFilterRow } from '@/components/data-grid/filters';
import { StatusBar, TotalsRow } from '@/components/data-grid/footer';
import { GroupPanel } from '@/components/data-grid/group-panel';
import { HeaderRows } from '@/components/data-grid/header';
import { ContextMenuEntries } from '@/components/data-grid/menu-entries';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { useCellMenu, useGridView, type CellMenuItems, type CoreTable, type GridInstance } from '@istec/grid';

export interface DataGridProps<TData extends object> extends Omit<DataRowOptions<TData>, 'rowHeight'> {
  table: GridInstance<TData>;
  headerHeight?: number;
  rowHeight?: number;
  /** Rows rendered beyond each edge of the viewport. */
  overscan?: number;
  /** Shown instead of the rows when none pass the filters. */
  noRows?: ReactNode;
  /** Covers the rows with a spinner, such as while they are fetched. */
  loading?: boolean;
  /** Adds a footer row with the totals of the aggregated columns. */
  showTotals?: boolean;
  /** Shows the row above the header that columns are dragged into to group by them. */
  showGroupPanel?: boolean;
  /** Shows a row under the header with a filter per column. */
  showFloatingFilters?: boolean;
  /** Shows the footer with the row counts. */
  showStatusBar?: boolean;
  /** Shown at the end of the status bar. */
  statusBar?: ReactNode;
  /** Items added below copy and paste in a cell's context menu. */
  cellMenuItems?: CellMenuItems<TData>;
  className?: string;
}

/** The grid of `@istec/grid` in shadcn/ui: header, virtualized rows and footer, with group panel and status bar. */
export function DataGrid<TData extends object>({
  table,
  headerHeight = 36,
  rowHeight = 32,
  overscan = 10,
  noRows,
  loading,
  showTotals = false,
  showGroupPanel = true,
  showFloatingFilters = false,
  showStatusBar = true,
  statusBar,
  cellMenuItems,
  className,
  ...rowEvents
}: DataGridProps<TData>) {
  const view = useGridView(table, { rowHeight, loading, showTotals, showGroupPanel });
  const rowOptions: DataRowOptions<TData> = { rowHeight, ...rowEvents };

  return (
    <table.AppTable>
      <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border text-xs', className)}>
        <ColumnReorder table={table}>
          {view.groupPanel && <GroupPanel table={table} />}
          <div
            {...view.gridProps}
            className="group/grid relative flex min-w-0 flex-1 flex-col overflow-hidden [--range-edge:color-mix(in_oklab,--theme(--color-primary)_40%,transparent)] focus-within:[--range-edge:--theme(--color-primary)]"
          >
            <div
              {...view.headerProps}
              className="scrollbar-gutter-stable overflow-hidden border-b bg-muted select-none"
            >
              <ColumnTable table={table}>
                <thead>
                  <HeaderRows table={table} headerHeight={headerHeight} />
                  {showFloatingFilters && <FloatingFilterRow table={table} height={rowHeight} />}
                </thead>
                {view.topRows.length > 0 && (
                  <tbody className="bg-background [&>tr:first-child>td]:border-t [&>tr:last-child>td]:border-b-0">
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
                className="min-h-0 flex-1 scrollbar-gutter-stable overflow-auto outline-none"
              >
                <VirtualRows
                  table={table}
                  scrollElement={view.scrollElement}
                  overscan={overscan}
                  noRows={noRows}
                  {...rowOptions}
                />
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                <CellMenu table={table} items={cellMenuItems} />
              </ContextMenuContent>
            </ContextMenu>
            {(view.bottomRows.length > 0 || view.totals) && (
              <div {...view.footerProps} className="scrollbar-gutter-stable overflow-hidden border-t">
                <ColumnTable table={table}>
                  <tbody className="[&>tr:last-child>td]:border-b-0">
                    {view.bottomRows.map((row) => (
                      <DataRow key={row.id} row={row} {...rowOptions} />
                    ))}
                    {view.totals && <TotalsRow table={table} rowHeight={rowHeight} />}
                  </tbody>
                </ColumnTable>
              </div>
            )}
            {view.busy && (
              <div className="absolute inset-0 z-30 flex items-center justify-center gap-2 bg-background/60 text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                {view.labels.loading}
              </div>
            )}
          </div>
        </ColumnReorder>
        {showStatusBar && <StatusBar table={table}>{statusBar}</StatusBar>}
      </div>
    </table.AppTable>
  );
}

// Rendered only while the menu is open; it acts on the range or the focused cell, which a right click focuses first.
function CellMenu<TData extends object>({ table, items }: { table: CoreTable<TData>; items?: CellMenuItems<TData> }) {
  return <ContextMenuEntries sections={useCellMenu(table, items)} />;
}

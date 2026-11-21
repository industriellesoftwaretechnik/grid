import type { ReactNode } from 'react';

import { cn } from 'cn';
import { LoaderCircle } from 'lucide-react';

import { DataRow, type DataRowOptions } from '#/grid/body/DataRow.tsx';
import { DetailRow } from '#/grid/body/DetailRow.tsx';
import { ColumnTable } from '#/grid/ColumnTable.tsx';
import { Button } from '#/internal/components/button.tsx';
import { gridMeta, useVirtualRows, type GridInstance, type Translate } from '@istec/grid-core';

export function VirtualRows<TData extends object>({
  table,
  scrollElement,
  overscan,
  noRows,
  ...rowOptions
}: DataRowOptions<TData> & {
  table: GridInstance<TData>;
  scrollElement: HTMLElement | null;
  overscan: number;
  noRows?: ReactNode;
}) {
  const { t } = gridMeta(table);
  const { rows, paddingTop, paddingBottom, sticky, colSpan, viewportWidth, measureElement, status, retry } =
    useVirtualRows(table, { scrollElement, rowHeight: rowOptions.rowHeight, overscan });

  if (rows.length === 0) {
    return (
      <ColumnTable table={table}>
        <tbody>
          {status === 'error' ? (
            <ServerStatusRow status="error" retry={retry} colSpan={colSpan} t={t} />
          ) : (
            <tr>
              <td colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {status === 'loading' ? null : (noRows ?? t('no-results'))}
              </td>
            </tr>
          )}
        </tbody>
      </ColumnTable>
    );
  }

  return (
    <>
      {sticky.length > 0 && (
        <div className="sticky top-0 z-10 h-0">
          {sticky.map(({ row, top, zIndex }) => (
            <ColumnTable key={row.id} table={table} className="absolute" style={{ top, zIndex }}>
              <tbody>
                <DataRow
                  row={row}
                  {...rowOptions}
                  rowClassName={(stuck) => cn('bg-background', rowOptions.rowClassName?.(stuck))}
                />
              </tbody>
            </ColumnTable>
          ))}
        </div>
      )}
      <ColumnTable table={table}>
        <tbody>
          {paddingTop > 0 && <tr aria-hidden style={{ height: paddingTop }} />}
          {rows.map((entry) =>
            entry.kind === 'detail' ? (
              <DetailRow
                key={entry.key}
                index={entry.index}
                measureRef={measureElement}
                colSpan={colSpan}
                width={viewportWidth}
              >
                {entry.detail}
              </DetailRow>
            ) : (
              <DataRow
                key={entry.key}
                row={entry.row}
                index={entry.index}
                measureRef={measureElement}
                {...rowOptions}
              />
            )
          )}
          {paddingBottom > 0 && <tr aria-hidden style={{ height: paddingBottom }} />}
          {(status === 'loadingMore' || status === 'error') && (
            <ServerStatusRow status={status} retry={retry} colSpan={colSpan} t={t} />
          )}
        </tbody>
      </ColumnTable>
    </>
  );
}

function ServerStatusRow({
  status,
  retry,
  colSpan,
  t,
}: {
  status: 'loadingMore' | 'error';
  retry: () => void;
  colSpan: number;
  t: Translate;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-8 px-3 text-muted-foreground">
        {status === 'error' ? (
          <span className="flex items-center gap-2 text-destructive">
            {t('load.failed')}
            <Button variant="outline" size="xs" onClick={retry}>
              {t('load.retry')}
            </Button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LoaderCircle className="size-3.5 animate-spin" />
            {t('loading')}
          </span>
        )}
      </td>
    </tr>
  );
}

import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { downloadCsv, type CsvExportOptions } from '#/parts/toolbar/csvExport.ts';

export interface ExportModel {
  /** Downloads the rows that pass the filters as CSV. */
  download: () => void;
  label: string;
}

/** The CSV export, named after the table's `id` unless `fileName` is given. */
export function useExport<TData extends RowData>(table: CoreTable<TData>, options: CsvExportOptions = {}): ExportModel {
  const t = useTranslate(table);
  return {
    download: () => downloadCsv(table, { fileName: gridMeta(table).tableId, ...options }),
    label: t('export'),
  };
}

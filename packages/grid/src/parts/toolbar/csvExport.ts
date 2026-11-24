import type { RowData } from '@tanstack/react-table';

import { filteredLeafRows, rowsAsText, selectedLeafRows, valueColumns } from '#/core/selection/gridCells.ts';
import { formatDelimited } from '#/core/shared/delimited.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable } from '#/core/table/types.ts';

/** Options of `tableCsv` and `downloadCsv`. */
export interface CsvExportOptions {
  /** Without `.csv`. Default: the table's `id`. */
  fileName?: string;
  /** Exports the selected rows instead of all rows that pass the filters. Default: `false`. */
  onlySelected?: boolean;
  /** Default: `';'`. */
  separator?: string;
}

/** The table as CSV: a header line and the rows' values as the columns show them, without display columns. */
export function tableCsv<TData extends RowData>(table: CoreTable<TData>, options: CsvExportOptions = {}): string {
  const rows = options.onlySelected ? selectedLeafRows(table) : filteredLeafRows(table);
  return formatDelimited(rowsAsText(rows, valueColumns(table), true), options.separator ?? gridDefaults.csvSeparator);
}

/** Downloads `tableCsv` as a UTF-8 file that Excel opens. */
export function downloadCsv<TData extends RowData>(table: CoreTable<TData>, options: CsvExportOptions = {}) {
  // The byte order mark makes Excel read the file as UTF-8.
  const blob = new Blob(['﻿', tableCsv(table, options)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.fileName ?? gridMeta(table).tableId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

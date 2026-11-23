import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/types.ts';
import { gridDefaults } from '#/defaults.ts';
import { formatDelimited } from '#/logic/export/delimited.ts';
import { filteredLeafRows, rowsAsText, selectedLeafRows, valueColumns } from '#/logic/focus/gridCells.ts';

export interface CsvExportOptions {
  fileName?: string;
  /** Only the selected rows instead of all that pass the filters. */
  onlySelected?: boolean;
  separator?: string;
}

/** The rows that pass the filters, in their order, with the visible columns as they are shown. */
export function tableCsv<TData extends RowData>(table: CoreTable<TData>, options: CsvExportOptions = {}): string {
  const rows = options.onlySelected ? selectedLeafRows(table) : filteredLeafRows(table);
  return formatDelimited(rowsAsText(rows, valueColumns(table), true), options.separator ?? gridDefaults.csvSeparator);
}

export function downloadCsv<TData extends RowData>(table: CoreTable<TData>, options: CsvExportOptions = {}) {
  // The byte order mark makes Excel read the file as UTF-8.
  const blob = new Blob(['﻿', tableCsv(table, options)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.fileName ?? 'export'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

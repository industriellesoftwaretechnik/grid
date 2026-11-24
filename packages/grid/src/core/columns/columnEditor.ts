import type { RowData } from '@tanstack/react-table';

import { columnMeta } from '#/core/columns/columnInfo.ts';
import { dataTypeDefaults } from '#/core/columns/columnMeta.ts';
import { parseEditorText, type EditorKind } from '#/core/columns/editorValue.ts';
import { formatValue } from '#/core/columns/format.ts';
import type { GridColumn } from '#/core/table/types.ts';

// A custom editor's column reads text by its data type.
export function editorKindOf<TData extends RowData>(column: GridColumn<TData>): EditorKind {
  const meta = columnMeta(column);
  return typeof meta.editor === 'string' ? meta.editor : dataTypeDefaults[meta.dataType].editor;
}

export function editorOptions<TData extends RowData>(column: GridColumn<TData>): readonly unknown[] {
  const meta = column.columnDef.meta;
  if (meta?.options) return meta.options;
  return [...column.getFacetedUniqueValues().keys()]
    .filter((value) => value !== null && value !== undefined)
    .toSorted((a, b) => formatValue(a, column).localeCompare(formatValue(b, column)));
}

export function parseCellText<TData extends RowData>(column: GridColumn<TData>, text: string) {
  const kind = editorKindOf(column);
  return parseEditorText(text, kind, kind === 'select' ? editorOptions(column) : [], (value) =>
    formatValue(value, column)
  );
}

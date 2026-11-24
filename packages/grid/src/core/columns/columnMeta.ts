import type { ReactNode } from 'react';

import type { EditorKind } from '#/core/columns/editorValue.ts';
import type { AggregationName } from '#/core/table/aggregations.ts';

/** What a column holds; it sets the column's defaults through `dataTypeDefaults`. */
export type DataType = 'text' | 'number' | 'date' | 'enum';
/** The kind of column filter: text search, number range, date range or a set of values. */
export type FilterKind = 'text' | 'number' | 'date' | 'set';
/** Alignment of the column's header, cells and total. */
export type ColumnAlign = 'start' | 'center' | 'end';

/** Props of a custom cell editor given as `meta.editor`. */
export interface CellEditorProps {
  /** The cell's value. */
  value: unknown;
  /** The typed key that started the edit, to replace the value with; `undefined` otherwise. */
  initialText: string | undefined;
  /** Sets the value and closes the editor, or returns the validation message and keeps it open. */
  commit: (value: unknown) => string | undefined;
  /** Closes the editor without changing the value. */
  cancel: () => void;
  /** The row's data. */
  row: unknown;
}

/** Computes a column setting per cell from its value and the row's data. */
export type CellRule<T> = (value: unknown, row: unknown) => T;

/** The grid's settings in a column definition's `meta`; unset ones come from `dataTypeDefaults`. */
export interface GridColumnMeta {
  /** Inferred from the first row as `number`, `date` or `text`; `enum` must be set. */
  dataType?: DataType;
  /** The column's name in menus, panels and copied headers; defaults to a string header, then the column id. */
  label?: string;
  /** Defaults to the data type's. */
  align?: ColumnAlign;
  headerClassName?: string;
  /** A class for every cell, or per cell from a rule. */
  cellClassName?: string | CellRule<string | undefined>;
  /** `true` shows the cell's text as the tooltip; a rule gives the tooltip per cell. */
  tooltip?: boolean | CellRule<string | undefined>;
  /** A built-in editor or a component rendering a custom one; defaults to the data type's. */
  editor?: EditorKind | ((props: CellEditorProps) => ReactNode);
  /** The `select` editor's choices; defaults to the column's values, sorted. */
  options?: readonly unknown[];
  /** Turns a value other than `null` or `undefined` into text for cells, the search, set filter options and totals. */
  formatValue?: (value: unknown) => string;
  /** `false` turns the column filter off; defaults to the data type's. */
  filter?: FilterKind | false;
  /** `false` removes the header's menu. */
  menu?: false;
  /** The aggregations the column menu offers; defaults to the data type's. */
  aggregations?: readonly AggregationName[];
  /** The column cannot be moved, and a full-width group row leaves its cell. */
  lockPosition?: boolean;
}

export interface ResolvedColumnMeta extends GridColumnMeta {
  dataType: DataType;
  align: ColumnAlign;
  filter: FilterKind | false;
  aggregations: readonly AggregationName[];
}

/** The settings each data type gives a column; `editor` also sets how a custom editor's column parses pasted text. */
export const dataTypeDefaults: Record<
  DataType,
  Pick<ResolvedColumnMeta, 'align' | 'filter' | 'aggregations'> & { editor: EditorKind }
> = {
  text: { align: 'start', filter: 'text', editor: 'text', aggregations: ['count', 'uniqueCount'] },
  number: {
    align: 'end',
    filter: 'number',
    editor: 'number',
    aggregations: ['sum', 'mean', 'median', 'min', 'max', 'count'],
  },
  date: { align: 'start', filter: 'date', editor: 'date', aggregations: ['min', 'max', 'count'] },
  enum: { align: 'start', filter: 'set', editor: 'select', aggregations: ['count', 'uniqueCount'] },
};

function inferDataType(value: unknown): DataType {
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  return 'text';
}

export function resolveMeta(meta: GridColumnMeta | undefined, sampleValue?: unknown): ResolvedColumnMeta {
  const dataType = meta?.dataType ?? inferDataType(sampleValue);
  const defaults = dataTypeDefaults[dataType];
  return {
    ...meta,
    dataType,
    align: meta?.align ?? defaults.align,
    filter: meta?.filter ?? defaults.filter,
    aggregations: meta?.aggregations ?? defaults.aggregations,
  };
}

import type { ReactNode } from 'react';

import type { EditorKind } from '#/core/columns/editorValue.ts';
import type { AggregationName } from '#/core/table/aggregations.ts';

export type DataType = 'text' | 'number' | 'date' | 'enum';
export type FilterKind = 'text' | 'number' | 'date' | 'set';
export type ColumnAlign = 'start' | 'center' | 'end';

/** What a custom editor in `meta.editor` gets. It renders inside the cell while the cell is edited. */
export interface CellEditorProps {
  value: unknown;
  /** The key that started the edit, to replace the value with. */
  initialText: string | undefined;
  /** Sets the value and closes the editor, or returns the validation message and keeps it open. */
  commit: (value: unknown) => string | undefined;
  cancel: () => void;
  /** The row's data. */
  row: unknown;
}

/** Called with the cell's value and the row's data. */
export type CellRule<T> = (value: unknown, row: unknown) => T;

/** Column settings, set in a column definition's `meta`. Unset ones come from `dataTypeDefaults`. */
export interface GridColumnMeta {
  /** Inferred from the first row as `number`, `date` or `text`; `enum` must be set. */
  dataType?: DataType;
  /** The name in menus and group rows. Defaults to a string header, then the column id. */
  label?: string;
  align?: ColumnAlign;
  headerClassName?: string;
  /** Classes for every cell, or per cell from its value, such as a color for negative numbers. */
  cellClassName?: string | CellRule<string | undefined>;
  /** `true` shows the cell's text as a tooltip, which helps where it is cut off. */
  tooltip?: boolean | CellRule<string | undefined>;
  /** The editor of an editable column, or a component of its own. Defaults to one for its data type. */
  editor?: EditorKind | ((props: CellEditorProps) => ReactNode);
  /** The choices of a `select` editor, in this order. Defaults to the values in the column, sorted. */
  options?: readonly unknown[];
  /** The text of a value in cells, the search, set filter options and totals. */
  formatValue?: (value: unknown) => string;
  /** `false` turns column filtering off. */
  filter?: FilterKind | false;
  /** `false` removes the header's context menu. */
  menu?: false;
  /** The aggregations the column menu offers. */
  aggregations?: readonly AggregationName[];
  /** Keeps the column where it is defined: it cannot be moved, and a full-width group row leaves its cell. */
  lockPosition?: boolean;
}

export interface ResolvedColumnMeta extends GridColumnMeta {
  dataType: DataType;
  align: ColumnAlign;
  filter: FilterKind | false;
  aggregations: readonly AggregationName[];
}

/**
 * What a column gets from its data type for each setting its `meta` leaves unset. `editor` is also how a custom editor's
 * column reads pasted text.
 */
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

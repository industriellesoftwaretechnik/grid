import {
  assignPrototypeAPIs,
  assignTableAPIs,
  makeStateUpdater,
  setStateSlice,
  type CellData,
  type OnChangeFn,
  type Row,
  type RowData,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/table-core';

import { samePosition, type CellPosition } from '#/logic/selection/cellRanges.ts';

/** The edited cell. `initialText` is what the editor starts with instead of the value, such as the typed key. */
export type EditingCellState = (CellPosition & { initialText?: string }) | null;

export interface CellValueInput extends CellPosition {
  value: unknown;
}

export interface CellValueRejection extends CellPosition {
  message: string;
}

/** What `onCellValueChange` receives. The table never changes `data`; its owner applies `updatedRow`. */
export interface CellValueChange<TFeatures extends TableFeatures, TData extends RowData> {
  row: Row<TFeatures, TData>;
  columnId: string;
  value: unknown;
  previousValue: unknown;
  /**
   * A copy of the row's data with the value written, by the column's `setCellValue` or at its `accessorKey`. When
   * one action changes several cells of a row, such as a paste, each change builds on the one before.
   */
  updatedRow: TData;
}

interface CellEditingColumnDef<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData> {
  /** Turns editing on for the column, or for the rows the function accepts. Defaults to `false`. */
  enableEditing?: boolean | ((row: Row<TFeatures, TData>) => boolean);
  /** Writes an edited value into a copy of the row. Needed for columns without an `accessorKey`. */
  setCellValue?: (original: TData, value: TValue) => TData;
  /** Returns a message when the value is not accepted; the editor then stays open. */
  validateCellValue?: (value: TValue, row: Row<TFeatures, TData>) => string | undefined;
}

interface CellEditingOptions<TFeatures extends TableFeatures, TData extends RowData> {
  /** `false` turns editing off for every column. Defaults to `true`. */
  enableEditing?: boolean;
  onCellValueChange?: (change: CellValueChange<TFeatures, TData>) => void;
  onEditingCellChange?: OnChangeFn<EditingCellState>;
  /** How many edits Ctrl+Z can undo; a paste counts as one. Defaults to 50; 0 turns undo off. */
  cellEditHistoryLimit?: number;
}

interface CellEditingTable {
  getEditingCell: () => EditingCellState;
  setEditingCell: (updater: Updater<EditingCellState>) => void;
  stopEditing: () => void;
  /**
   * Sets several cells as one undoable edit, skipping cells that cannot be edited or reject their value. Returns the
   * rejected cells with their validation messages.
   */
  setCellValues: (values: readonly CellValueInput[]) => CellValueRejection[];
  /** Reverts the last edit through `onCellValueChange`. Returns whether there was one. */
  undoCellEdit: () => boolean;
  redoCellEdit: () => boolean;
}

interface CellEditingCell {
  getCanEdit: () => boolean;
  getIsEditing: () => boolean;
  startEditing: (initialText?: string) => void;
  /** Validates the value and reports it through `onCellValueChange`; returns the validation message instead. */
  setValue: (value: unknown) => string | undefined;
}

declare module '@tanstack/table-core' {
  interface Plugins {
    cellEditingFeature: TableFeature;
  }
  interface TableState_FeatureMap {
    cellEditingFeature: { editingCell: EditingCellState };
  }
  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    cellEditingFeature: CellEditingOptions<TFeatures, TData>;
  }
  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    cellEditingFeature: CellEditingTable;
  }
  interface ColumnDef_FeatureMap<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData> {
    cellEditingFeature: CellEditingColumnDef<TFeatures, TData, TValue>;
  }
  interface Cell_FeatureMap {
    cellEditingFeature: CellEditingCell;
  }
}

interface Edit extends CellPosition {
  previousValue: unknown;
  value: unknown;
}

// The feature's runtime view of the objects it works on; the public types above come from the feature maps.
interface AnyRow {
  id: string;
  original: unknown;
  getIsGrouped: () => boolean;
  getValue: (columnId: string) => unknown;
}
interface AnyColumn {
  id: string;
  columnDef: {
    accessorKey?: unknown;
    enableEditing?: boolean | ((row: AnyRow) => boolean);
    setCellValue?: (original: unknown, value: unknown) => unknown;
    validateCellValue?: (value: unknown, row: AnyRow) => string | undefined;
  };
}
interface EditingTable {
  options: { enableEditing?: boolean; cellEditHistoryLimit?: number; onCellValueChange?: (change: unknown) => void };
  atoms: { editingCell: { get: () => EditingCellState } };
  getRow: (rowId: string, searchAll?: boolean) => AnyRow | undefined;
  getColumn: (columnId: string) => AnyColumn | undefined;
  cellEditHistory: { undo: Edit[][]; redo: Edit[][] };
}
interface AnyCell {
  row: AnyRow;
  column: AnyColumn;
  table: unknown;
}

function asEditingTable(table: unknown): EditingTable {
  if (!isEditingTable(table)) throw new Error('cellEditingFeature needs a TanStack table.');
  return table;
}

function isEditingTable(table: unknown): table is EditingTable {
  return typeof table === 'object' && table !== null && 'options' in table && 'atoms' in table;
}

/** Writes `value` at a dotted `accessorKey` path into copies of the objects along it. */
export function setAtPath(target: unknown, path: string, value: unknown): unknown {
  const [key, ...rest] = path.split('.');
  if (key === undefined) return value;
  const source = typeof target === 'object' && target !== null ? target : {};
  const next: unknown = rest.length === 0 ? value : setAtPath(Reflect.get(source, key), rest.join('.'), value);
  return Array.isArray(source) ? source.with(Number(key), next) : { ...source, [key]: next };
}

function canEdit(table: EditingTable, row: AnyRow, column: AnyColumn): boolean {
  const { enableEditing, setCellValue, accessorKey } = column.columnDef;
  if (table.options.enableEditing === false || row.getIsGrouped()) return false;
  if (setCellValue === undefined && typeof accessorKey !== 'string') return false;
  return typeof enableEditing === 'function' ? enableEditing(row) : enableEditing === true;
}

function write(column: AnyColumn, original: unknown, value: unknown): unknown {
  const { setCellValue, accessorKey } = column.columnDef;
  if (setCellValue) return setCellValue(original, value);
  return setAtPath(original, String(accessorKey), value);
}

/** Reports the edits, each building on the earlier ones of its row. */
function emit(table: EditingTable, edits: readonly Edit[]) {
  const updated = new Map<string, unknown>();
  for (const edit of edits) {
    const row = table.getRow(edit.rowId, true);
    const column = table.getColumn(edit.columnId);
    if (!row || !column) continue;
    const updatedRow = write(column, updated.has(row.id) ? updated.get(row.id) : row.original, edit.value);
    updated.set(row.id, updatedRow);
    table.options.onCellValueChange?.({
      row,
      columnId: column.id,
      value: edit.value,
      previousValue: edit.previousValue,
      updatedRow,
    });
  }
}

function setValues(table: EditingTable, values: readonly CellValueInput[]): CellValueRejection[] {
  const edits: Edit[] = [];
  const rejected: CellValueRejection[] = [];
  for (const { rowId, columnId, value } of values) {
    const row = table.getRow(rowId, true);
    const column = table.getColumn(columnId);
    if (!row || !column || !canEdit(table, row, column)) continue;
    const message = column.columnDef.validateCellValue?.(value, row);
    if (message !== undefined) rejected.push({ rowId, columnId, message });
    else {
      const previousValue = row.getValue(columnId);
      if (!Object.is(previousValue, value)) edits.push({ rowId, columnId, previousValue, value });
    }
  }
  if (edits.length > 0) {
    emit(table, edits);
    const history = table.cellEditHistory;
    history.undo = [...history.undo, edits].slice(-(table.options.cellEditHistoryLimit ?? 50));
    history.redo = [];
  }
  return rejected;
}

function replay(table: EditingTable, from: 'undo' | 'redo'): boolean {
  const history = table.cellEditHistory;
  const edits = history[from].at(-1);
  if (!edits) return false;
  history[from] = history[from].slice(0, -1);
  emit(
    table,
    from === 'undo'
      ? edits.toReversed().map(({ rowId, columnId, value, previousValue }) => ({
          rowId,
          columnId,
          value: previousValue,
          previousValue: value,
        }))
      : edits
  );
  const to = from === 'undo' ? 'redo' : 'undo';
  history[to] = [...history[to], edits];
  return true;
}

export const cellEditingFeature: TableFeature = {
  getInitialState: (state) => ({ editingCell: null, ...state }),
  getDefaultTableOptions: (table) => ({
    enableEditing: true,
    onEditingCellChange: makeStateUpdater('editingCell', table),
  }),
  initTableInstanceData: (table) => {
    asEditingTable(table).cellEditHistory = { undo: [], redo: [] };
  },
  resetTableInstanceData: (table) => {
    asEditingTable(table).cellEditHistory = { undo: [], redo: [] };
  },
  constructTableAPIs: (table) => {
    const editingTable = asEditingTable(table);
    const setEditingCell = (updater: Updater<EditingCellState>) =>
      setStateSlice(table, 'editingCell', updater, samePosition);
    assignTableAPIs('cellEditingFeature', table, {
      table_getEditingCell: { fn: () => editingTable.atoms.editingCell.get() },
      table_setEditingCell: { fn: setEditingCell },
      table_stopEditing: { fn: () => setEditingCell(null) },
      table_setCellValues: { fn: (values: readonly CellValueInput[]) => setValues(editingTable, values) },
      table_undoCellEdit: { fn: () => replay(editingTable, 'undo') },
      table_redoCellEdit: { fn: () => replay(editingTable, 'redo') },
    });
  },
  assignCellPrototype: (prototype, table) => {
    assignPrototypeAPIs('cellEditingFeature', prototype, table, {
      cell_getCanEdit: { fn: (cell: AnyCell) => canEdit(asEditingTable(cell.table), cell.row, cell.column) },
      cell_getIsEditing: {
        fn: (cell: AnyCell) => {
          const editing = asEditingTable(cell.table).atoms.editingCell.get();
          return editing?.rowId === cell.row.id && editing.columnId === cell.column.id;
        },
      },
      cell_startEditing: {
        fn: (cell: AnyCell & { table: CellEditingTable }, initialText?: string) => {
          if (!canEdit(asEditingTable(cell.table), cell.row, cell.column)) return;
          cell.table.setEditingCell({ rowId: cell.row.id, columnId: cell.column.id, initialText });
        },
      },
      cell_setValue: {
        fn: (cell: AnyCell, value: unknown) => {
          const [rejected] = setValues(asEditingTable(cell.table), [
            { rowId: cell.row.id, columnId: cell.column.id, value },
          ]);
          return rejected?.message;
        },
      },
    });
  },
};

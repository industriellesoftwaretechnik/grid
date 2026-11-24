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
} from '@tanstack/react-table';

import { samePosition, type CellPosition } from '#/core/selection/cellRanges.ts';

/** The cell being edited, or `null`; `initialText`, such as the typed key, replaces the value in the editor. */
export type EditingCellState = (CellPosition & { initialText?: string }) | null;

/** A value to set in a cell with `table.setCellValues`. */
export interface CellValueInput extends CellPosition {
  value: unknown;
}

/** A cell whose `validateCellValue` rejected the value, with its message. */
export interface CellValueRejection extends CellPosition {
  message: string;
}

/** A changed cell, reported to `onCellValueChange`; the table never changes `data`, its owner applies `updatedRow`. */
export interface CellValueChange<TFeatures extends TableFeatures, TData extends RowData> {
  /** The row as it was before the change. */
  row: Row<TFeatures, TData>;
  columnId: string;
  value: unknown;
  previousValue: unknown;
  /**
   * A copy of the row's data with the value set; when one action, such as a paste, changes several cells of a row,
   * each builds on the one before.
   */
  updatedRow: TData;
}

interface CellEditingColumnDef<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData> {
  /**
   * Whether the column's cells can be edited, per row when a function; editing also needs a string `accessorKey` or
   * `setCellValue`, and group rows are never edited. Default: `false`.
   */
  enableEditing?: boolean | ((row: Row<TFeatures, TData>) => boolean);
  /** Returns a copy of the row's data with the value set; needed for columns without a string `accessorKey`. */
  setCellValue?: (original: TData, value: TValue) => TData;
  /** Returns a message to reject the value, which keeps the editor open, or `undefined` to accept it. */
  validateCellValue?: (value: TValue, row: Row<TFeatures, TData>) => string | undefined;
}

interface CellEditingOptions<TFeatures extends TableFeatures, TData extends RowData> {
  /** `false` turns editing off for every column. Default: `true`. */
  enableEditing?: boolean;
  /** Called for each changed cell, also on undo and redo; apply `change.updatedRow` to `data`. */
  onCellValueChange?: (change: CellValueChange<TFeatures, TData>) => void;
  onEditingCellChange?: OnChangeFn<EditingCellState>;
  /** How many edits undo keeps; a paste counts as one, `0` turns undo off. Default: `50`. */
  cellEditHistoryLimit?: number;
}

interface CellEditingTable {
  /** Returns the cell being edited, or `null`. */
  getEditingCell: () => EditingCellState;
  /** Sets the cell being edited without checking that it can be edited; `cell.startEditing` checks. */
  setEditingCell: (updater: Updater<EditingCellState>) => void;
  /** Closes the editor without changing the value. */
  stopEditing: () => void;
  /**
   * Sets several cells as one undoable edit and returns the cells that reject their value; cells that cannot be edited
   * or keep their value are skipped.
   */
  setCellValues: (values: readonly CellValueInput[]) => CellValueRejection[];
  /** Reverts the latest edit through `onCellValueChange`; returns `false` when there is none. */
  undoCellEdit: () => boolean;
  /** Reapplies the latest undone edit through `onCellValueChange`; returns `false` when there is none. */
  redoCellEdit: () => boolean;
}

interface CellEditingCell {
  /** Whether the cell can be edited: see the column's `enableEditing`. */
  getCanEdit: () => boolean;
  /** Whether the editor is open on this cell. */
  getIsEditing: () => boolean;
  /** Opens the editor if the cell can be edited; `initialText`, such as a typed key, replaces the value. */
  startEditing: (initialText?: string) => void;
  /**
   * Sets the value as one undoable edit through `onCellValueChange`, or returns the validation message; does nothing
   * if the cell cannot be edited.
   */
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

/** Copies the objects along the dotted path instead of mutating them. */
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
    const limit = table.options.cellEditHistoryLimit ?? 50;
    // `slice(-0)` would keep everything.
    history.undo = limit > 0 ? [...history.undo, edits].slice(-limit) : [];
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

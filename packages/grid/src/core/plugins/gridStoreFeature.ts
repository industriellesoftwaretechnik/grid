import { createAtom, type Atom, type ReadonlyAtom } from '@tanstack/react-store';
import type { RowData, TableFeature, TableFeatures } from '@tanstack/react-table';

import { sameShallow } from '#/core/shared/sameValue.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';

type MetaValues = Pick<GridMeta, 't' | 'treeData' | 'expandColumn' | 'ownColumnVisibility'>;

/** The options and meta values the table's owner passes in, which are no state of the table. */
export interface GridInputs extends Partial<MetaValues> {
  data: unknown;
  columns: unknown;
  groupDisplay: unknown;
}

/** What the grid's components render from: the table state with the inputs of its owner. */
export interface GridSnapshot extends GridInputs {
  state: object;
}

export type GridStore = ReadonlyAtom<GridSnapshot>;

declare module '@tanstack/table-core' {
  interface Plugins {
    gridStoreFeature: TableFeature;
  }
  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    gridStoreFeature: {
      /** Everything the grid renders from; `useGridSelector` subscribes to it. */
      gridStore: GridStore;
      /** The owner's inputs, which `publishGridInputs` writes after each of its renders. */
      gridInputs: Atom<GridInputs>;
    };
  }
}

interface InputsTable {
  options: { data?: unknown; columns?: unknown; groupDisplay?: unknown; meta?: Partial<GridMeta> };
}

interface StoreTable extends InputsTable {
  store: { get: () => object };
}

function isStoreTable(table: unknown): table is StoreTable {
  return typeof table === 'object' && table !== null && 'store' in table && 'options' in table;
}

function inputsOf({ options }: InputsTable): GridInputs {
  const { data, columns, groupDisplay, meta = {} } = options;
  return {
    data,
    columns,
    groupDisplay,
    t: meta.t,
    treeData: meta.treeData,
    expandColumn: meta.expandColumn,
    ownColumnVisibility: meta.ownColumnVisibility,
  };
}

/**
 * Writes the table's current options into its inputs, notifying the grid's components of what changed. `useGrid`
 * calls it after each render, when React's adapter publishes the controlled state too.
 */
export function publishGridInputs(table: InputsTable & { gridInputs: Atom<GridInputs> }) {
  table.gridInputs.set(inputsOf(table));
}

/**
 * Adds `table.gridStore`, one source for everything the grid renders from: the table's state from `table.store`, and
 * `data`, `columns` and the values of the grid's meta, which are options and so no state. Other options are taken to
 * stay the same.
 */
export const gridStoreFeature: TableFeature = {
  constructTableAPIs: (table) => {
    if (!isStoreTable(table)) throw new Error('gridStoreFeature needs a TanStack table.');
    const inputs = createAtom(inputsOf(table), { compare: sameShallow });
    const { store } = table;
    const gridStore = createAtom((): GridSnapshot => ({ state: store.get(), ...inputs.get() }), {
      compare: sameShallow,
    });
    Object.assign(table, { gridInputs: inputs, gridStore });
  },
};

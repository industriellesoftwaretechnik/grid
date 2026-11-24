import { createAtom, type Atom, type ReadonlyAtom } from '@tanstack/react-store';
import type { RowData, TableFeature, TableFeatures } from '@tanstack/react-table';

import { sameShallow } from '#/core/shared/sameValue.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';

type MetaValues = Pick<GridMeta, 'locale' | 'treeData' | 'expandColumn' | 'ownColumnVisibility'>;

/** Options and meta values the owner passes in; not table state. */
export interface GridInputs extends Partial<MetaValues> {
  data: unknown;
  columns: unknown;
  groupDisplay: unknown;
}

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
      /** The table state with the options and meta values passed in; what `useGridSelector` subscribes to. */
      gridStore: GridStore;
      /** The options and meta values passed in, which `useGrid` publishes after each render. */
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
    locale: meta.locale,
    treeData: meta.treeData,
    expandColumn: meta.expandColumn,
    ownColumnVisibility: meta.ownColumnVisibility,
  };
}

export function publishGridInputs(table: InputsTable & { gridInputs: Atom<GridInputs> }) {
  table.gridInputs.set(inputsOf(table));
}

// Only the options in `GridInputs` are tracked; others are taken to stay the same.
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

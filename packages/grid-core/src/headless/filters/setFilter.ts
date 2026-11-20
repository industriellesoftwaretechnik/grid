import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridColumn } from '#/core/types.ts';
import { formatValue } from '#/logic/format.ts';

export interface SetFilterOption {
  /** Unique in the list; usable as key. */
  key: number;
  label: string;
  /** The values the option stands for: one, or every blank value for the blank option. */
  values: unknown[];
  /** Left out where the loaded rows are not all rows, as with server rows. */
  count?: number;
}

export interface CheckState {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// null, undefined and '' look the same in a cell, so they share one option. The column's meta.options are offered
// even where no row has them; server rows offer only those and the loaded values, without counts.
function allOptions<TData extends RowData>(column: GridColumn<TData>): SetFilterOption[] {
  const { t, server } = gridMeta(column.table);
  const withCounts = server === undefined;
  const counts = new Map<unknown, number>(column.columnDef.meta?.options?.map((value) => [value, 0]));
  for (const [value, count] of column.getFacetedUniqueValues()) counts.set(value, (counts.get(value) ?? 0) + count);
  const empty: SetFilterOption = { key: 0, label: t('filter.empty'), values: [], count: withCounts ? 0 : undefined };
  const options: SetFilterOption[] = [];
  for (const [value, count] of counts) {
    if (value === null || value === undefined || value === '') {
      empty.values.push(value);
      if (empty.count !== undefined) empty.count += count;
    } else {
      options.push({
        key: 0,
        label: formatValue(value, column),
        values: [value],
        count: withCounts ? count : undefined,
      });
    }
  }
  options.sort((a, b) => collator.compare(a.label, b.label));
  if (empty.values.length > 0) options.unshift(empty);
  options.forEach((option, index) => {
    option.key = index;
  });
  return options;
}

/**
 * The set filter of a column: its values as options, which of them pass, and actions that write the filter. `query`
 * narrows the options to those whose label contains it. Everything checked means no filter.
 */
export function setFilter<TData extends RowData>(column: GridColumn<TData>, query: string) {
  const options = allOptions(column);
  const allValues = options.flatMap((option) => option.values);
  const filterValue = column.getFilterValue();
  const selected = Array.isArray(filterValue) ? new Set<unknown>(filterValue) : undefined;
  const isChecked = (option: SetFilterOption) => !selected || option.values.some((value) => selected.has(value));

  const search = query.trim().toLowerCase();
  const found = search ? options.filter((option) => option.label.toLowerCase().includes(search)) : options;
  const foundChecked = found.filter(isChecked).length;

  const apply = (values: Set<unknown>) =>
    column.setFilterValue(allValues.every((value) => values.has(value)) ? undefined : [...values]);
  const toggle = (targets: SetFilterOption[], checked: boolean) => {
    const next = new Set(selected ?? allValues);
    for (const value of targets.flatMap((option) => option.values)) {
      if (checked) next.add(value);
      else next.delete(value);
    }
    apply(next);
  };

  return {
    /** The options `query` finds. */
    options: found,
    isChecked,
    toggle,
    /** The "select all" checkbox over the options found. */
    selectAll: {
      checked: found.length > 0 && foundChecked === found.length,
      indeterminate: foundChecked > 0 && foundChecked < found.length,
      disabled: found.length === 0,
    } satisfies CheckState,
    toggleAll: (checked: boolean) => toggle(found, checked),
    /** Keeps only the values found, as Enter in the search does. */
    keepFound: () => apply(new Set(found.flatMap((option) => option.values))),
    clear: () => column.setFilterValue(undefined),
  };
}

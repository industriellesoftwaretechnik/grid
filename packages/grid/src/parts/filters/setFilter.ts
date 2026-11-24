import type { RowData } from '@tanstack/react-table';

import { formatValue, localeFormats } from '#/core/columns/format.ts';
import type { GridColumn } from '#/core/table/types.ts';

/** A value a set filter offers to check. */
export interface SetFilterOption {
  key: number;
  /** Empty for the blank option, which the UI names. */
  label: string;
  /** The option for blank values comes first. */
  blank: boolean;
  /** One value, or every blank value for the blank option. */
  values: unknown[];
  /** Among the rows the other filters let through. */
  count: number;
}

export interface CheckState {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
}

// null, undefined and '' look the same in a cell, so they share one option; meta.options show even where no row has them.
export function setFilterOptions<TData extends RowData>(column: GridColumn<TData>): SetFilterOption[] {
  const { collator } = localeFormats(column.table.options.meta?.locale);
  const counts = new Map<unknown, number>(column.columnDef.meta?.options?.map((value) => [value, 0]));
  for (const [value, count] of column.getFacetedUniqueValues()) counts.set(value, (counts.get(value) ?? 0) + count);
  const empty: SetFilterOption = { key: 0, label: '', blank: true, values: [], count: 0 };
  const options: SetFilterOption[] = [];
  for (const [value, count] of counts) {
    if (value === null || value === undefined || value === '') {
      empty.values.push(value);
      empty.count += count;
    } else {
      options.push({ key: 0, label: formatValue(value, column), blank: false, values: [value], count });
    }
  }
  options.sort((a, b) => collator.compare(a.label, b.label));
  if (empty.values.length > 0) options.unshift(empty);
  options.forEach((option, index) => {
    option.key = index;
  });
  return options;
}

// Everything checked means no filter.
export function setFilter<TData extends RowData>(column: GridColumn<TData>, query: string) {
  return setFilterModel(column, setFilterOptions(column), column.getFilterValue(), query);
}

export function setFilterModel<TData extends RowData>(
  column: GridColumn<TData>,
  options: SetFilterOption[],
  filterValue: unknown,
  query: string
) {
  const allValues = options.flatMap((option) => option.values);
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
    /** Every option is checked while the column is not filtered. */
    isChecked,
    /** Checks or unchecks the options; checking all of them removes the filter. */
    toggle,
    /** The select-all checkbox, over the options found. */
    selectAll: {
      checked: found.length > 0 && foundChecked === found.length,
      indeterminate: foundChecked > 0 && foundChecked < found.length,
      disabled: found.length === 0,
    } satisfies CheckState,
    /** Checks or unchecks the options found. */
    toggleAll: (checked: boolean) => toggle(found, checked),
    /** Checks only the options found, as Enter in the search does. */
    keepFound: () => apply(new Set(found.flatMap((option) => option.values))),
    /** Removes the filter. */
    clear: () => column.setFilterValue(undefined),
  };
}

import type { AggregationName, CellEditorError, FilterSummary, GridMenuId, GridStatus } from '@istec/grid';

// The grid's texts: edit them here to reword or translate. Numbers and dates follow `useGrid`'s `locale`.

export const messages = {
  search: 'Search…',
  noRows: 'No results.',
  loading: 'Loading…',
  /** The header of the group column (`groupDisplay: 'groupColumn'`). */
  groupColumn: 'Group',
  expand: 'Expand',
  collapse: 'Collapse',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  columnMenu: 'Column menu',
  columns: 'Columns',
  clearFilters: 'Clear all filters',
  export: 'Export',
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  clearSelection: 'Clear selection',
  editValue: 'Edit value',
  filter: 'Filter',
  clearFilter: 'Clear filter',
  textFilter: 'Contains…',
  numberBounds: ['Min', 'Max'],
  dateBounds: ['From', 'To'],
  searchValues: 'Search values…',
  selectAllValues: 'Select all',
  blank: '(Blank)',
  noneSelected: 'Nothing selected',
  numberHint: 'e.g. 10, ≥ 10, 10 – 20',
  groupPanel: 'Grouping',
  groupPanelPlaceholder: 'Drag columns here to group by them',
  moveGroupLevel: 'Move grouping level',
  removeGrouping: 'Remove grouping',
} as const;

export const menuLabels: Record<GridMenuId, string> = {
  'sort.asc': 'Sort ascending',
  'sort.desc': 'Sort descending',
  'sort.clear': 'Clear sort',
  filter: 'Filter',
  'filter.clear': 'Clear filter',
  pin: 'Pin',
  'pin.start': 'Left',
  'pin.end': 'Right',
  'pin.none': 'Not pinned',
  'group.by': 'Group by this column',
  'group.remove': 'Remove grouping',
  aggregation: 'Aggregation',
  'aggregation.none': 'None',
  'aggregation.sum': 'Sum',
  'aggregation.mean': 'Average',
  'aggregation.median': 'Median',
  'aggregation.min': 'Minimum',
  'aggregation.max': 'Maximum',
  'aggregation.count': 'Count',
  'aggregation.uniqueCount': 'Distinct count',
  'column.hide': 'Hide column',
  'columns.reset': 'Reset columns',
  copy: 'Copy',
  'copy.with-headers': 'Copy with headers',
  paste: 'Paste',
};

export const menuShortcuts: Partial<Record<GridMenuId, string>> = { copy: 'Ctrl+C', paste: 'Ctrl+V' };

// Plain characters of one font: combined marks such as x̃ or #≠ mix fallback fonts and sit askew.
export const aggregationSymbols: Record<AggregationName, string> = {
  sum: 'Σ',
  mean: 'Ø',
  median: 'med',
  min: 'min',
  max: 'max',
  count: '#',
  uniqueCount: 'uniq',
};

export const aggregationName = (aggregation: AggregationName) => menuLabels[`aggregation.${aggregation}`];

export function statusTexts(status: GridStatus, format: (value: number) => string) {
  return {
    rows:
      status.shownRows === status.rows
        ? `${format(status.rows)} rows`
        : `${format(status.shownRows)} of ${format(status.rows)} rows`,
    groups: status.groups > 0 ? `${format(status.groups)} groups` : undefined,
    selected: status.selectedRows > 0 ? `${format(status.selectedRows)} selected` : undefined,
    cells: status.cells && `${format(status.cells.count)} cells`,
  };
}

export function editorErrorText(error: CellEditorError): string {
  if (error.type === 'rule') return error.message;
  if (error.type === 'number') return 'Not a valid number';
  if (error.type === 'date') return 'Not a valid date';
  return 'Not a valid value';
}

// As AG Grid's floating filters show it: `a – b`, `≥ a`, `≤ b`, or `(3) a, b, c`.
export function filterSummaryText(summary: FilterSummary | undefined): string {
  if (!summary) return '';
  if (summary.kind === 'text') return summary.text;
  if (summary.kind === 'range') {
    const { from, to } = summary;
    if (from !== undefined && to !== undefined) return from === to ? from : `${from} – ${to}`;
    return from !== undefined ? `≥ ${from}` : `≤ ${to ?? ''}`;
  }
  const values = summary.blank ? [messages.blank, ...summary.values] : summary.values;
  if (values.length === 0) return messages.noneSelected;
  return values.length <= 2 ? values.join(', ') : `(${values.length}) ${values.join(', ')}`;
}

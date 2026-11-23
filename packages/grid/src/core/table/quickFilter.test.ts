import { constructTable, createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { quickFilter } from '#/core/table/quickFilter.ts';
import { testFeatures } from '#/core/table/testFeatures.ts';
import type { GridFeatures } from '#/core/table/types.ts';

type Person = { id: string; firstName: string; lastName: string; status: string; email: string };

const helper = createColumnHelper<GridFeatures, Person>();
const columns = helper.columns([
  helper.accessor('firstName', { header: 'First name' }),
  helper.accessor('lastName', { header: 'Last name' }),
  helper.accessor('status', { header: 'Status', meta: { formatValue: (value) => `label-${String(value)}` } }),
  helper.accessor('email', { header: 'Email', enableGlobalFilter: false }),
]);
const data: Person[] = [
  { id: '1', firstName: 'Max', lastName: 'Müller', status: 'active', email: 'max@example.com' },
  { id: '2', firstName: 'Maxi', lastName: 'Schmidt', status: 'inactive', email: 'maxi@example.com' },
  { id: '3', firstName: 'Anna', lastName: 'Müller', status: 'active', email: 'anna@example.com' },
];

function search(globalFilter: string) {
  const table = constructTable({
    features: testFeatures,
    columns,
    data,
    getRowId: (person) => person.id,
    globalFilterFn: quickFilter,
    getColumnCanGlobalFilter: () => true,
    initialState: { globalFilter },
  });
  return table.getFilteredRowModel().rows.map((row) => row.id);
}

describe('quickFilter', () => {
  it('needs every word, each in any column', () => {
    expect(search('max müller')).toEqual(['1']);
    expect(search('Müller  MAX ')).toEqual(['1']);
    expect(search('max')).toEqual(['1', '2']);
  });

  it('matches the displayed value and skips columns left out of the search', () => {
    expect(search('label-inactive')).toEqual(['2']);
    expect(search('example.com')).toEqual([]);
  });
});

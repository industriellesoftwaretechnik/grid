import { useState } from 'react';

import { DataGrid } from '@/components/data-grid/data-grid';
import { ClearFiltersButton, ColumnsButton, ExportButton, SearchInput } from '@/components/data-grid/toolbar';
import { ButtonGroup } from '@/components/ui/button-group';
import { peopleColumns } from '@/people/peopleColumns';
import { samplePeople, type Person } from '@/people/samplePeople';
import { gridMessagesDe, useGrid, type CellMenuItem, type CoreTable, type GridCell } from '@istec/grid';

const getRowId = (person: Person) => person.id;
const initialState = {
  sorting: [{ id: 'lastName', desc: false }],
  columnPinning: { start: ['select'], end: [] },
};
const cellMenuItems = (cell: GridCell<Person>): CellMenuItem[] => [
  {
    label: 'Write email',
    onSelect: () => {
      window.open(`mailto:${cell.row.original.email}`);
    },
  },
];

/** The demo's toolbar: the grid renders none, the app places the parts it wants. */
function Toolbar({ table }: { table: CoreTable<Person> }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ButtonGroup>
        <ClearFiltersButton table={table} />
        <ColumnsButton table={table} />
        <ExportButton table={table} />
      </ButtonGroup>
      <SearchInput table={table} />
    </div>
  );
}

function PersonDetail({ person }: { person: Person }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-medium">
        {person.firstName} {person.lastName}
      </p>
      <p className="text-muted-foreground">
        {person.email} · {person.department} · since {person.joinDate.toLocaleDateString()}
      </p>
    </div>
  );
}

export function PeopleGrid({ german }: { german: boolean }) {
  const [data, setData] = useState(() => samplePeople(10_000, 7));
  const table = useGrid({
    id: 'people',
    columns: peopleColumns,
    data,
    getRowId,
    persist: true,
    initialState,
    messages: german ? gridMessagesDe : undefined,
    groupDisplay: 'groupColumn',
    renderDetail: (row) => <PersonDetail person={row.original} />,
    onCellValueChange: ({ updatedRow }) =>
      setData((people) => people.map((person) => (person.id === updatedRow.id ? updatedRow : person))),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Toolbar table={table} />
      <DataGrid table={table} showTotals showFloatingFilters cellMenuItems={cellMenuItems} />
    </div>
  );
}

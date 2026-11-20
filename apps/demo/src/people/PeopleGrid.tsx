import { useState } from 'react';

import { peopleColumns } from '@/people/peopleColumns';
import { fetchPeople, savePerson } from '@/people/peopleServer';
import { samplePeople, type Person } from '@/people/samplePeople';
import { DataGrid, gridMessagesDe, useDataGrid, type CellMenuItem, type GridCell } from '@istec/grid-ui';

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

export function ClientPeopleGrid({ german }: { german: boolean }) {
  const [data, setData] = useState(() => samplePeople(10_000, 7));
  const table = useDataGrid({
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

  return <DataGrid table={table} showTotals showFloatingFilters cellMenuItems={cellMenuItems} />;
}

export function ServerPeopleGrid({ german }: { german: boolean }) {
  const table = useDataGrid({
    id: 'people-server',
    columns: peopleColumns,
    fetchRows: fetchPeople,
    getRowId,
    persist: true,
    initialState,
    messages: german ? gridMessagesDe : undefined,
    onCellValueChange: ({ updatedRow }) => void savePerson(updatedRow),
  });

  return <DataGrid table={table} showFloatingFilters />;
}

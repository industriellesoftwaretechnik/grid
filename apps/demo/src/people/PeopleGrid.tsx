import { useState } from 'react';

import { Mail } from 'lucide-react';

import { DataGrid, type CellMenuSections } from '@/components/data-grid/data-grid';
import { ClearFiltersButton, ColumnsButton, ExportButton, SearchInput } from '@/components/data-grid/toolbar';
import { ButtonGroup } from '@/components/ui/button-group';
import { peopleColumns } from '@/people/peopleColumns';
import { samplePeople, type Person } from '@/people/samplePeople';
import { useGrid, type CoreTable } from '@istec/grid';

const getRowId = (person: Person) => person.id;
const initialState = {
  sorting: [{ id: 'lastName', desc: false }],
  columnPinning: { start: ['select'], end: [] },
};
// The cell menu is data: the demo adds a section of its own below copy and paste.
const cellMenu: CellMenuSections<Person> = (sections, cell) =>
  cell
    ? [
        ...sections,
        {
          id: 'person',
          entries: [
            {
              type: 'item',
              id: 'email',
              label: 'Write email',
              icon: <Mail />,
              onSelect: () => {
                window.open(`mailto:${cell.row.original.email}`);
              },
            },
          ],
        },
      ]
    : sections;

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

export function PeopleGrid({ locale }: { locale: string }) {
  const [data, setData] = useState(() => samplePeople(10_000, 7));
  const table = useGrid({
    id: 'people',
    columns: peopleColumns,
    data,
    getRowId,
    persist: true,
    initialState,
    locale,
    groupDisplay: 'groupColumn',
    renderDetail: (row) => <PersonDetail person={row.original} />,
    onCellValueChange: ({ updatedRow }) =>
      setData((people) => people.map((person) => (person.id === updatedRow.id ? updatedRow : person))),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Toolbar table={table} />
      <DataGrid table={table} aria-label="People" showTotals showFloatingFilters cellMenu={cellMenu} />
    </div>
  );
}

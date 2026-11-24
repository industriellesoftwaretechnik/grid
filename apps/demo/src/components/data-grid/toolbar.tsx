import { ChevronsDownUp, ChevronsUpDown, Columns3, Download, FilterX, Search } from 'lucide-react';

import { DropdownMenuEntries } from '@/components/data-grid/menu-entries';
import { messages } from '@/components/data-grid/messages';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import {
  downloadCsv,
  useColumnsMenu,
  useGridSelector,
  useSearch,
  type CoreTable,
  type CsvExportOptions,
} from '@istec/grid';

// The grid renders none of these; place them anywhere. Outline buttons, so they join in a `ButtonGroup`.

export function SearchInput<TData extends object>({
  table,
  className,
}: {
  table: CoreTable<TData>;
  className?: string;
}) {
  const search = useSearch(table);

  return (
    <InputGroup className={cn('w-64', className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={messages.search}
        placeholder={messages.search}
        value={search.text}
        onChange={(event) => search.change(event.target.value)}
      />
    </InputGroup>
  );
}

/** Downloads the filtered rows as CSV, named after the table unless `fileName` is given. */
export function ExportButton<TData extends object>({
  table,
  ...options
}: { table: CoreTable<TData> } & CsvExportOptions) {
  return (
    <Button variant="outline" onClick={() => downloadCsv(table, options)}>
      <Download />
      {messages.export}
    </Button>
  );
}

/** Renders nothing while there are no groups or tree nodes. */
export function ExpandCollapseButtons<TData extends object>({
  table,
  size,
  className,
}: {
  table: CoreTable<TData>;
  size?: 'sm';
  className?: string;
}) {
  const available = useGridSelector(table, () => table.getCanExpandParentRows());
  if (!available) return null;

  return (
    <ButtonGroup className={className}>
      <Button variant="outline" size={size} onClick={() => table.expandParentRows()}>
        <ChevronsUpDown />
        {messages.expandAll}
      </Button>
      <Button variant="outline" size={size} onClick={() => table.toggleAllRowsExpanded(false)}>
        <ChevronsDownUp />
        {messages.collapseAll}
      </Button>
    </ButtonGroup>
  );
}

/** Also clears the search. */
export function ClearFiltersButton<TData extends object>({ table }: { table: CoreTable<TData> }) {
  const count = useGridSelector(table, () => table.getActiveFilterCount());

  return (
    <Button variant="outline" disabled={count === 0} onClick={() => table.clearFilters()}>
      <FilterX />
      {messages.clearFilters}
    </Button>
  );
}

export function ColumnsButton<TData extends object>({ table }: { table: CoreTable<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Columns3 />
        {messages.columns}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <ColumnsMenuEntries table={table} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Rendered only while the menu is open, and kept current while it is.
function ColumnsMenuEntries<TData extends object>({ table }: { table: CoreTable<TData> }) {
  return <DropdownMenuEntries sections={useColumnsMenu(table)} />;
}

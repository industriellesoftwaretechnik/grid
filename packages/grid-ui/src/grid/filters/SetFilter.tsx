import type { RowData } from '@tanstack/react-table';
import { Search } from 'lucide-react';

import { ClearFilterButton } from '#/grid/filters/ClearFilterButton.tsx';
import { SetFilterList } from '#/grid/filters/SetFilterList.tsx';
import { Checkbox } from '#/internal/components/checkbox.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '#/internal/components/input-group.tsx';
import { useSetFilter, type GridColumn } from '@istec/grid-core';

export function SetFilter<TData extends RowData>({ column }: { column: GridColumn<TData> }) {
  const filter = useSetFilter(column);

  return (
    <>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label={filter.searchLabel}
          placeholder={filter.searchLabel}
          value={filter.query}
          onChange={(event) => filter.setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') filter.keepFound();
          }}
        />
      </InputGroup>
      <div className="flex flex-col gap-0.5">
        <label className="flex h-8 cursor-pointer items-center gap-2 rounded-sm border-b px-2 font-medium hover:bg-muted">
          <Checkbox
            checked={filter.selectAll.checked}
            indeterminate={filter.selectAll.indeterminate}
            disabled={filter.selectAll.disabled}
            onCheckedChange={() => filter.toggleAll(!filter.selectAll.checked)}
          />
          {filter.selectAllLabel}
        </label>
        <SetFilterList
          options={filter.options}
          isChecked={filter.isChecked}
          onToggle={(option, checked) => filter.toggle([option], checked)}
        />
      </div>
      <ClearFilterButton label={filter.clearLabel} enabled={filter.canClear} onClear={filter.clear} />
    </>
  );
}

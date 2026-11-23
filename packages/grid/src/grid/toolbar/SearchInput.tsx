import { useState } from 'react';

import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';
import { cn } from 'cn';
import { Search } from 'lucide-react';

import { useTableContext } from '#/core/tableContext.ts';
import { gridDefaults } from '#/defaults.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { InputGroup, InputGroupAddon, InputGroupInput } from '#/internal/components/input-group.tsx';

/**
 * The search across all columns. Place it inside the grid, such as in `DataGrid`'s `toolbar`. The input is
 * uncontrolled; typing writes the search, debounced.
 */
export function SearchInput({ className }: { className?: string }) {
  const table = useTableContext();
  const t = useTranslate(table);
  const [defaultValue] = useState(() => String(table.atoms.globalFilter.get() ?? ''));
  const setGlobalFilter = useDebouncedCallback((value: string) => table.setGlobalFilter(value), {
    wait: gridDefaults.debounceMs,
  });

  return (
    <InputGroup className={cn('ig:w-64', className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={t('search')}
        placeholder={t('search')}
        defaultValue={defaultValue}
        onChange={(event) => setGlobalFilter(event.target.value)}
      />
    </InputGroup>
  );
}

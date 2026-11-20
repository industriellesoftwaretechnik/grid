import { cn } from 'cn';
import { Search } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '#/internal/components/input-group.tsx';
import { useSearchInput } from '@istec/grid-core';

/** The search across all columns. Place it inside the grid, such as in `DataGrid`'s `toolbar`. */
export function SearchInput({ className }: { className?: string }) {
  const { label, defaultValue, change } = useSearchInput();

  return (
    <InputGroup className={cn('w-64', className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={label}
        defaultValue={defaultValue}
        onChange={(event) => change(event.target.value)}
      />
    </InputGroup>
  );
}

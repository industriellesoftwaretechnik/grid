import { useDebouncer } from '@tanstack/react-pacer/debouncer';
import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { gridDefaults } from '#/defaults.ts';

export function useFilterWriter<TData extends RowData>(column: GridColumn<TData>) {
  // Closing the popover unmounts the editor; the last keystrokes must still reach the table.
  const debouncer = useDebouncer((value: unknown) => column.setFilterValue(value), {
    wait: gridDefaults.debounceMs,
    onUnmount: (instance) => instance.flush(),
  });

  return {
    write: debouncer.maybeExecute,
    clear: () => {
      debouncer.cancel();
      column.setFilterValue(undefined);
    },
  };
}

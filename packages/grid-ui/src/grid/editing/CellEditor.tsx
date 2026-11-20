import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import { useCellEditor, type GridCell } from '@istec/grid-core';

const inputClassName = 'h-full w-full min-w-0 bg-background px-2 text-xs outline-none';

/** Renders inside the edited cell. */
export function CellEditor<TData extends RowData>({ cell }: { cell: GridCell<TData> }) {
  const { kind, custom, error, inputProps, selectProps, options } = useCellEditor(cell);

  if (custom !== undefined) return <div className="h-full w-full">{custom}</div>;

  return (
    <>
      {kind === 'select' ? (
        <select {...selectProps} className={inputClassName}>
          <option value="">–</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...inputProps} className={cn(inputClassName, kind === 'number' && 'text-right')} />
      )}
      {error !== undefined && (
        <div
          role="alert"
          className="absolute top-full left-0 z-30 mt-0.5 rounded-sm bg-destructive px-2 py-1 whitespace-nowrap text-white shadow-sm"
        >
          {error}
        </div>
      )}
    </>
  );
}

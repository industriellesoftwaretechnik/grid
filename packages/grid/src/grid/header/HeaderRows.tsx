import type { GridInstance } from '#/core/tableHook.tsx';
import { HeaderCell } from '#/grid/header/HeaderCell.tsx';
import { useHeaderRows } from '#/grid/header/headerRows.ts';

export function HeaderRows<TData extends object>({
  table,
  headerHeight,
}: {
  table: GridInstance<TData>;
  headerHeight: number;
}) {
  return useHeaderRows(table).map((row) => (
    <tr key={row.id}>
      {row.slots.map((slot) =>
        slot === 'filler' ? (
          <th key="filler" aria-hidden />
        ) : (
          <HeaderCell key={slot.header.id} table={table} slot={slot} height={headerHeight} />
        )
      )}
    </tr>
  ));
}

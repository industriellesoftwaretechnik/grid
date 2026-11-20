import { HeaderCell } from '#/grid/header/HeaderCell.tsx';
import { headerRows, type GridInstance } from '@istec/grid-core';

export function HeaderRows<TData extends object>({
  table,
  headerHeight,
}: {
  table: GridInstance<TData>;
  headerHeight: number;
}) {
  return headerRows(table).map((row) => (
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

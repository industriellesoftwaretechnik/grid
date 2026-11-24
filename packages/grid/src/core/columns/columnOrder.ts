export interface OrderedTable {
  getAllColumns: () => readonly { getLeafColumns: () => readonly { id: string }[] }[];
  atoms: { columnOrder: { get: () => readonly string[] } };
}

// Built from state, not from getAllLeafColumns(), which also moves grouped columns to the front.
export function columnOrderIds(table: OrderedTable): string[] {
  const defined = table.getAllColumns().flatMap((column) => column.getLeafColumns().map((leaf) => leaf.id));
  const ordered = table.atoms.columnOrder.get().filter((id) => defined.includes(id));
  return [...ordered, ...defined.filter((id) => !ordered.includes(id))];
}

export function moveColumns(order: string[], moving: string[], target: string[]): string[] {
  const position = (ids: string[]) => Math.min(...ids.map((id) => order.indexOf(id)));
  const block = order.filter((id) => moving.includes(id));
  const rest = order.filter((id) => !moving.includes(id));
  const targetIds = rest.filter((id) => target.includes(id));
  const first = targetIds[0];
  const last = targetIds.at(-1);
  if (block.length === 0 || first === undefined || last === undefined) return order;
  const at = position(target) > position(moving) ? rest.indexOf(last) + 1 : rest.indexOf(first);
  return [...rest.slice(0, at), ...block, ...rest.slice(at)];
}

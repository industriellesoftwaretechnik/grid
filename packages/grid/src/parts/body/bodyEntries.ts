interface ExpandableRow {
  id: string;
  depth: number;
  subRows: readonly unknown[];
  getIsExpanded: () => boolean;
}

/** The full-width row under an expanded master row that holds its detail. */
export interface DetailEntry<TRow> {
  detailOf: TRow;
  id: string;
  depth: number;
  getIsExpanded: () => boolean;
}

export type BodyEntry<TRow> = TRow | DetailEntry<TRow>;

export function isDetailEntry<TRow extends object>(entry: BodyEntry<TRow>): entry is DetailEntry<TRow> {
  return 'detailOf' in entry;
}

/** Rows with children expand to them; the others expand to their detail. */
export function isDetailOpen(row: ExpandableRow): boolean {
  return row.subRows.length === 0 && row.getIsExpanded();
}

const closed = () => false;

/**
 * `bodyEntries` with details, built again only when the rows or the expanded state change: which details are open
 * follows from nothing else, unless the table's `getIsRowExpanded` decides it, which `expanded` must then stand for.
 */
export function createBodyEntriesCache<TRow extends ExpandableRow>() {
  let last: { rows: TRow[]; expanded: unknown; entries: BodyEntry<TRow>[] } | undefined;
  return (rows: TRow[], expanded: unknown): BodyEntry<TRow>[] => {
    if (last?.rows !== rows || last.expanded !== expanded) last = { rows, expanded, entries: bodyEntries(rows, true) };
    return last.entries;
  };
}

/** The rows of the body with the detail of each expanded master row after it. */
export function bodyEntries<TRow extends ExpandableRow>(rows: TRow[], withDetails: boolean): BodyEntry<TRow>[] {
  if (!withDetails) return rows;
  return rows.flatMap((row) =>
    isDetailOpen(row)
      ? [row, { detailOf: row, id: `${row.id}:detail`, depth: row.depth + 1, getIsExpanded: closed }]
      : [row]
  );
}

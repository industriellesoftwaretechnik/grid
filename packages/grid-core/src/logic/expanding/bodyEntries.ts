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

/** The rows of the body with the detail of each expanded master row after it. */
export function bodyEntries<TRow extends ExpandableRow>(rows: TRow[], withDetails: boolean): BodyEntry<TRow>[] {
  if (!withDetails) return rows;
  return rows.flatMap((row) =>
    isDetailOpen(row)
      ? [row, { detailOf: row, id: `${row.id}:detail`, depth: row.depth + 1, getIsExpanded: () => false }]
      : [row]
  );
}

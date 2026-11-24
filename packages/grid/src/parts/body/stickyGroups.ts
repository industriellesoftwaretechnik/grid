interface TreeRow {
  depth: number;
  getIsExpanded: () => boolean;
}

export interface StickyRow {
  index: number;
  top: number;
}

function groupChain(rows: TreeRow[], index: number) {
  const row = rows[index];
  if (!row) return [];
  const open = row.getIsExpanded() && (rows[index + 1]?.depth ?? -1) > row.depth;
  const chain = open ? [index] : [];
  let depth = row.depth;
  for (let i = index - 1; i >= 0 && depth > 0; i--) {
    const candidate = rows[i];
    if (candidate && candidate.depth < depth) {
      chain.push(i);
      depth = candidate.depth;
    }
  }
  return chain.toReversed();
}

function lastInGroup(rows: TreeRow[], index: number) {
  const depth = rows[index]?.depth ?? 0;
  let last = index;
  while ((rows[last + 1]?.depth ?? -1) > depth) last++;
  return last;
}

// A pushed row slides under its parents, so parents must be drawn on top.
export function stickyGroupRows(
  rows: TreeRow[],
  offset: number,
  rowHeight: number,
  indexAt: (offset: number) => number | undefined,
  endOf: (index: number) => number
): StickyRow[] {
  let chain: number[] = [];
  for (;;) {
    const index = indexAt(offset + chain.length * rowHeight);
    if (index === undefined) break;
    const next = groupChain(rows, index);
    if (next.length <= chain.length) break;
    chain = next;
  }

  return chain.map((index, level) => ({
    index,
    top: Math.min(level * rowHeight, endOf(lastInGroup(rows, index)) - offset - rowHeight),
  }));
}

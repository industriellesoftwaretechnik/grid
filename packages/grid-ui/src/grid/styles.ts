import { cn } from 'cn';

import type { CellLook, ColumnAlign, Region } from '@istec/grid-core';

/** The group panel above the header and the status bar below the rows share their padding; the status bar is lower. */
export const barClassName = 'flex min-h-8 items-center bg-muted/40 px-2 py-0.5';

/**
 * The focused cell's 1px outline, shown like the range while the grid has the focus. The style is set explicitly:
 * the cell's outline-none leaves a `none` style that a bare outline would inherit.
 */
export const focusOutlineClassName =
  'group-focus-within/grid:outline-1 group-focus-within/grid:outline-solid group-focus-within/grid:-outline-offset-1 group-focus-within/grid:outline-primary';

export const textAlign: Record<ColumnAlign, string> = { start: 'text-left', center: 'text-center', end: 'text-right' };
export const flexAlign: Record<ColumnAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

export function pinnedClassName(region: Region, edge: boolean) {
  if (region === 'center') return undefined;
  return cn('bg-background', edge && (region === 'start' ? 'border-r' : 'border-l'));
}

/** The edges of a range, drawn inside the cells along it. `--range-edge` is set on the grid. */
export function rangeShadow({ top, right, bottom, left }: CellLook): string | undefined {
  const sides = [
    top && 'inset 0 1px 0 var(--range-edge)',
    right && 'inset -1px 0 0 var(--range-edge)',
    bottom && 'inset 0 -1px 0 var(--range-edge)',
    left && 'inset 1px 0 0 var(--range-edge)',
  ].filter(Boolean);
  return sides.length > 0 ? sides.join(', ') : undefined;
}

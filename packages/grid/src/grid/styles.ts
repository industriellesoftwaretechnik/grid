import { cn } from 'cn';

import type { CellLook } from '#/grid/body/useBodyCell.ts';
import type { ColumnAlign } from '#/logic/columns/columnMeta.ts';
import type { Region } from '#/logic/layout.ts';

/** The group panel above the header and the status bar below the rows share their padding; the status bar is lower. */
export const barClassName = 'ig:flex ig:min-h-8 ig:items-center ig:bg-muted/40 ig:px-2 ig:py-0.5';

/**
 * The focused cell's 1px outline, shown like the range while the grid has the focus. The style is set explicitly:
 * the cell's outline-none leaves a `none` style that a bare outline would inherit.
 */
export const focusOutlineClassName =
  'ig:group-focus-within/grid:outline-1 ig:group-focus-within/grid:outline-solid ig:group-focus-within/grid:-outline-offset-1 ig:group-focus-within/grid:outline-primary';

export const textAlign: Record<ColumnAlign, string> = {
  start: 'ig:text-left',
  center: 'ig:text-center',
  end: 'ig:text-right',
};
export const flexAlign: Record<ColumnAlign, string> = {
  start: 'ig:justify-start',
  center: 'ig:justify-center',
  end: 'ig:justify-end',
};

export function pinnedClassName(region: Region, edge: boolean) {
  if (region === 'center') return undefined;
  return cn('ig:bg-background', edge && (region === 'start' ? 'ig:border-r' : 'ig:border-l'));
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

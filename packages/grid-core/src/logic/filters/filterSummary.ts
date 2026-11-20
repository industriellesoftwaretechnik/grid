import type { FilterKind } from '#/logic/columns/columnMeta.ts';

export interface SummaryText {
  format: (value: unknown) => string;
  empty: string;
  noneSelected: string;
}

const isBlank = (value: unknown) => value === null || value === undefined || value === '';

/**
 * A filter value as text, as AG Grid's floating filters show it: the typed text, a range as `a – b`, `≥ a` or `≤ b`,
 * and the chosen set values, counted first when there are more than two. Empty when nothing is filtered.
 */
export function filterSummary(kind: FilterKind, value: unknown, text: SummaryText): string {
  if (value === undefined) return '';
  if (kind === 'set') {
    if (!Array.isArray(value)) return '';
    const labels = [...new Set(value.map((item) => (isBlank(item) ? text.empty : text.format(item))))];
    if (labels.length === 0) return text.noneSelected;
    return labels.length <= 2 ? labels.join(', ') : `(${labels.length}) ${labels.join(', ')}`;
  }
  if (kind === 'text') return typeof value === 'string' ? value : '';
  if (!Array.isArray(value)) return '';
  const [min, max] = value.map((bound) => (bound === undefined ? '' : text.format(bound)));
  if (min && max) return min === max ? min : `${min} – ${max}`;
  if (min) return `≥ ${min}`;
  if (max) return `≤ ${max}`;
  return '';
}

/** The text of a text filter's input, and the filter value of that text. */
export const textFilterText = (value: unknown) => (typeof value === 'string' ? value : '');
export const textFilterValue = (text: string) => text || undefined;

export type NumberRange = [number | undefined, number | undefined];

const number = String.raw`(-?\d+(?:[.,]\d+)*)`;
const patterns: [RegExp, (a: number, b: number) => NumberRange][] = [
  [new RegExp(String.raw`^=?\s*${number}$`), (a) => [a, a]],
  [new RegExp(String.raw`^(?:>=|≥|>)\s*${number}$`), (a) => [a, undefined]],
  [new RegExp(String.raw`^(?:<=|≤|<)\s*${number}$`), (a) => [undefined, a]],
  [new RegExp(String.raw`^${number}\s*(?:–|-|\.\.)\s*${number}$`), (a, b) => [a, b]],
];

// German input writes the decimal comma and may group thousands with dots: 1.234,5
function parseNumber(text: string): number {
  return Number(text.includes(',') ? text.replaceAll('.', '').replace(',', '.') : text);
}

/**
 * Reads a typed number filter: `5`, `≥ 5` or `>= 5`, `≤ 5` or `<= 5`, and `5 – 10` or `5-10`. Bounds are inclusive,
 * so `>` reads as `≥`. Returns `undefined` for empty text and `null` for text it cannot read.
 */
export function parseNumberRange(text: string): NumberRange | undefined | null {
  const trimmed = text.trim();
  if (trimmed === '') return undefined;
  for (const [pattern, toRange] of patterns) {
    const match = pattern.exec(trimmed);
    if (!match) continue;
    const [a, b] = [parseNumber(match[1] ?? ''), parseNumber(match[2] ?? '')];
    const range = toRange(a, b);
    return range.every((bound) => bound === undefined || Number.isFinite(bound)) ? range : null;
  }
  return null;
}

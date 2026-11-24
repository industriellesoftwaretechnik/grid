/**
 * How an input's text reads as a value and the value writes back as text, for `useFilterInput` and `useSearch`.
 * `toValue` gives `undefined` for text that means no value, and `null` for text it cannot read, which the input keeps
 * without writing it.
 */
export interface InputCodec<T> {
  toText: (value: unknown) => T;
  toValue: (text: T) => unknown;
}

/** Plain text, as the search and a `text` filter take it; empty text is no filter. */
export const textCodec: InputCodec<string> = {
  toText: (value) => (typeof value === 'string' ? value : ''),
  toValue: (text) => text || undefined,
};

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

// Plain digits with a decimal point, never an exponent, so that the text reads back as the same number.
const plainNumber = new Intl.NumberFormat('en-US', { useGrouping: false, maximumFractionDigits: 10 });
const boundText = (bound: unknown) =>
  typeof bound === 'number' && Number.isFinite(bound) ? plainNumber.format(bound) : '';

/** A number range typed into one input, as the floating filter takes it: `5`, `≥ 5`, `≤ 5` or `5 – 10`. */
export const numberRangeCodec: InputCodec<string> = {
  toText: (value) => {
    if (!Array.isArray(value)) return '';
    const [from, to] = [boundText(value[0]), boundText(value[1])];
    if (from && to) return from === to ? from : `${from} – ${to}`;
    if (from) return `≥ ${from}`;
    return to ? `≤ ${to}` : '';
  },
  toValue: parseNumberRange,
};

const pad = (value: number) => String(value).padStart(2, '0');

/** How one bound reads and writes the text of its input. */
interface BoundText {
  toText: (value: unknown) => string;
  fromText: (text: string, bound: 0 | 1) => unknown;
}

const numberBound: BoundText = {
  toText: boundText,
  fromText: (text) => {
    const value = text.trim() === '' ? Number.NaN : Number(text);
    return Number.isFinite(value) ? value : undefined;
  },
};

// The `yyyy-mm-dd` of a date input. It stands for a local calendar day; the upper bound covers that whole day.
const dateBound: BoundText = {
  toText: (value) => {
    if (typeof value === 'string') return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  },
  fromText: (text, bound) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) return undefined;
    const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
    return bound === 0 ? new Date(year, month, day) : new Date(year, month, day, 23, 59, 59, 999);
  },
};

/**
 * A range in two inputs, from and to, either of which may stay empty: numbers, or dates as the `yyyy-mm-dd` of a date
 * input.
 */
export function boundsCodec(type: 'number' | 'date'): InputCodec<[string, string]> {
  return type === 'number' ? numberBoundsCodec : dateBoundsCodec;
}

function boundsOf({ toText, fromText }: BoundText): InputCodec<[string, string]> {
  return {
    toText: (value) => (Array.isArray(value) ? [toText(value[0]), toText(value[1])] : ['', '']),
    toValue: ([from, to]) => {
      const bounds = [fromText(from, 0), fromText(to, 1)];
      return bounds[0] === undefined && bounds[1] === undefined ? undefined : bounds;
    },
  };
}

const numberBoundsCodec = boundsOf(numberBound);
const dateBoundsCodec = boundsOf(dateBound);

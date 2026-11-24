/**
 * Converts between a filter value and an input's text. `toValue` gives `undefined` for no value and `null` for
 * unreadable text, which the input keeps without writing.
 */
export interface InputCodec<T> {
  toText: (value: unknown) => T;
  toValue: (text: T) => unknown;
}

/** A text filter typed into one input; empty text is no filter. */
export const textCodec: InputCodec<string> = {
  toText: (value) => (typeof value === 'string' ? value : ''),
  toValue: (text) => text || undefined,
};

/** Inclusive bounds, from and to; an `undefined` bound is open. */
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
 * Reads `5`, `≥ 5`, `<= 5`, `5 – 10` and the like, also with a decimal comma; bounds are inclusive, so `>` reads as
 * `≥`. Gives `undefined` for empty text and `null` for unreadable text.
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

/** A number range typed into one input: `5`, `≥ 5`, `≤ 5` or `5 – 10`. */
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

/** A range typed into two inputs, from and to; either may stay empty, and dates are a date input's `yyyy-mm-dd`. */
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

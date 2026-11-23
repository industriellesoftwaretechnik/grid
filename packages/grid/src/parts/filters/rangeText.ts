/** How the bounds of a range filter read and write the text of their inputs. */
export interface RangeText {
  toText: (value: unknown) => string;
  fromText: (text: string, bound: 0 | 1) => unknown;
}

const pad = (value: number) => String(value).padStart(2, '0');

export const numberRangeText: RangeText = {
  toText: (value) => (typeof value === 'number' && Number.isFinite(value) ? String(value) : ''),
  fromText: (text) => {
    const value = text.trim() === '' ? Number.NaN : Number(text);
    return Number.isFinite(value) ? value : undefined;
  },
};

// The `yyyy-mm-dd` of a date input. It stands for a local calendar day; the upper bound covers that whole day.
export const dateRangeText: RangeText = {
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

/** The built-in cell editors. */
export type EditorKind = 'text' | 'number' | 'date' | 'select';

export type ParseResult = { value: unknown } | { error: 'number' | 'date' | 'option' };

const pad = (value: number) => String(value).padStart(2, '0');

/** Dates use the `yyyy-mm-dd` of a date input. */
export function toEditorText(value: unknown, kind: EditorKind): string {
  if (value === null || value === undefined) return '';
  if (kind === 'date' && value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
}

function parseNumber(text: string): number | undefined {
  const trimmed = text.trim().replaceAll(/\s/g, '');
  // German input writes the decimal comma and may group thousands with dots: 1.234,5
  const normalized = trimmed.includes(',') ? trimmed.replaceAll('.', '').replace(',', '.') : trimmed;
  const value = Number(normalized);
  return normalized === '' || Number.isNaN(value) ? undefined : value;
}

function parseDate(text: string): Date | undefined {
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text.trim());
  const german = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
  const [year, month, day] = iso
    ? [iso[1], iso[2], iso[3]]
    : german
      ? [german[3], german[2], german[1]]
      : [undefined, undefined, undefined];
  if (year === undefined || month === undefined || day === undefined) return undefined;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getMonth() === Number(month) - 1 ? date : undefined;
}

/** Ignores case; options starting with the query come first. */
export function matchingOptions<T>(options: readonly T[], query: string, format: (option: T) => string): T[] {
  const wanted = query.trim().toLowerCase();
  if (wanted === '') return [...options];
  const starting: T[] = [];
  const containing: T[] = [];
  for (const option of options) {
    const text = format(option).toLowerCase();
    if (text.startsWith(wanted)) starting.push(option);
    else if (text.includes(wanted)) containing.push(option);
  }
  return [...starting, ...containing];
}

/** Empty text clears the value; a select accepts an option or the text it is shown with. */
export function parseEditorText(
  text: string,
  kind: EditorKind,
  options: readonly unknown[] = [],
  format: (value: unknown) => string = String
): ParseResult {
  if (text.trim() === '') return { value: kind === 'text' ? '' : null };
  if (kind === 'text') return { value: text };
  if (kind === 'number') {
    const value = parseNumber(text);
    return value === undefined ? { error: 'number' } : { value };
  }
  if (kind === 'date') {
    const value = parseDate(text);
    return value === undefined ? { error: 'date' } : { value };
  }
  const wanted = text.trim().toLowerCase();
  const match = options.find(
    (option) => toEditorText(option, kind).toLowerCase() === wanted || format(option).toLowerCase() === wanted
  );
  return match === undefined ? { error: 'option' } : { value: match };
}

function quote(value: string, separator: string): string {
  return value.includes(separator) || /["\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/** Rows of text as CSV or, with a tab, as the TSV spreadsheets put on the clipboard. */
export function formatDelimited(rows: readonly (readonly string[])[], separator: string): string {
  return rows.map((row) => row.map((value) => quote(value, separator)).join(separator)).join('\r\n');
}

export function parseDelimited(text: string, separator: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index++;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"' && value === '') quoted = true;
    else if (char === separator) {
      row.push(value);
      value = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else value += char;
  }
  if (value !== '' || row.length > 0) rows.push([...row, value]);
  return rows;
}

import en from '#/locale/en.ts';

/** Every text the grid shows. Placeholders use i18next's `{{name}}`, so an app's i18next bundles can supply them. */
export type GridMessages = Record<keyof typeof en, string>;
export type GridMessageKey = keyof GridMessages;
export type Translate = (key: GridMessageKey, values?: Record<string, string | number>) => string;

/** A translator over `messages`; keys they leave out stay English. */
export function createTranslate(messages: Partial<GridMessages> = {}): Translate {
  return (key, values) =>
    (messages[key] ?? en[key]).replaceAll(/\{\{(\w+)\}\}/g, (placeholder, name: string) => {
      const value = values?.[name];
      return value === undefined ? placeholder : String(value);
    });
}

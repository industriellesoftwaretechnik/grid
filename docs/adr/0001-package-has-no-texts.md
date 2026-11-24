# 1. The package has no texts, only a locale

Status: accepted, 2026-11-24

## Context

Through 0.2, `@istec/grid` shipped English and German messages, and every hook returned finished strings: labels,
`aria-label`s, status sentences such as "12 of 30 rows", aggregation symbols, filter summaries. A UI with other wording,
its own i18n library or icon-only buttons had to fight the models, and a custom control could not get at raw values.
Numbers were formatted in the browser's locale whatever language the messages were in.

## Decision

The package has no texts. Models return values and ids: counts, aggregation names, error codes, structured filter
summaries, menu entries named by `GridMenuId`. The UI words them; the shadcn implementation keeps its texts in
`components/data-grid/messages.ts`, in English.

The package keeps a `locale` (`useGrid({ locale })`), because formatting and sorting values is about what the data
means: cell text, totals, set filter order, `useFormatNumber`. Parsing typed and pasted numbers and dates accepts both
English and German notation regardless of the locale.

## Consequences

- Each UI brings its own texts, accessible names included; the registry's `messages.ts` is the template.
- Menus are data a UI can name, reorder, filter and extend.
- Tests assert values and ids, not English.
- Do not add strings, `label` fields or `aria-label` text to the package's models.

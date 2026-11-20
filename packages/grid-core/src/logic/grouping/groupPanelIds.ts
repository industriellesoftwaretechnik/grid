import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';

/** The droppable id of the group panel in the header's drag and drop. */
export const groupPanelId = 'group-panel';

/** Whether dropping the column into the group panel groups by it; `enableGrouping: false` turns that off. */
export function canGroupBy<TData extends RowData>(column: GridColumn<TData>): boolean {
  return column.getCanGroup() && !column.getIsGrouped();
}

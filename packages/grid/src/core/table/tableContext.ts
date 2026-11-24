import { createTableHookContexts } from '@tanstack/react-table';

import type { GridFeatures } from '#/core/table/features.ts';

const contexts = createTableHookContexts<GridFeatures>();

export const { tableContext } = contexts;
/** The table of the nearest `table.AppTable`, for components that are not passed it. */
export const useGridContext = contexts.useTableContext;

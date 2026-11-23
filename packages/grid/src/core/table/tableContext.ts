import { createTableHookContexts } from '@tanstack/react-table';

import type { GridFeatures } from '#/core/table/features.ts';

export const { tableContext, useTableContext } = createTableHookContexts<GridFeatures>();

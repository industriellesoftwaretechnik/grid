import { createTableHookContexts } from '@tanstack/react-table';

import type { GridFeatures } from '#/core/features.ts';

export const { tableContext, useTableContext } = createTableHookContexts<GridFeatures>();

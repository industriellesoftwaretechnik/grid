import { tableFeatures } from '@tanstack/react-table';
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings';

import { features } from '#/core/table/features.ts';

/** The table's features for `constructTable` in tests, which run without React. */
export const testFeatures = tableFeatures({ ...features, coreReactivityFeature: storeReactivityBindings() });

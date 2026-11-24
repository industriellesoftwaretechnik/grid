import { tableFeatures } from '@tanstack/react-table';
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings';

import { features } from '#/core/table/features.ts';

export const testFeatures = tableFeatures({ ...features, coreReactivityFeature: storeReactivityBindings() });

import {
  aggregationFn_count,
  aggregationFn_max,
  aggregationFn_mean,
  aggregationFn_median,
  aggregationFn_min,
  aggregationFn_sum,
  aggregationFn_uniqueCount,
} from '@tanstack/react-table';

export const aggregationFns = {
  sum: aggregationFn_sum,
  mean: aggregationFn_mean,
  median: aggregationFn_median,
  min: aggregationFn_min,
  max: aggregationFn_max,
  count: aggregationFn_count,
  uniqueCount: aggregationFn_uniqueCount,
};

export type AggregationName = keyof typeof aggregationFns;

/** Short, language-neutral marks for the aggregations, shown before a total and in the header while grouped. */
export const aggregationSymbols: Record<AggregationName, string> = {
  sum: 'Σ',
  mean: 'Ø',
  median: 'x̃',
  min: 'min',
  max: 'max',
  count: '#',
  uniqueCount: '#≠',
};

export function isAggregationName(value: unknown): value is AggregationName {
  return typeof value === 'string' && Object.hasOwn(aggregationFns, value);
}

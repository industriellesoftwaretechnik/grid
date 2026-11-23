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

/**
 * Short marks for the aggregations, shown before a total and an aggregated value. Each is plain characters of one
 * font: combined marks such as x̃ or #≠ mix fallback fonts and sit askew.
 */
export const aggregationSymbols: Record<AggregationName, string> = {
  sum: 'Σ',
  mean: 'Ø',
  median: 'med',
  min: 'min',
  max: 'max',
  count: '#',
  uniqueCount: 'uniq',
};

export function isAggregationName(value: unknown): value is AggregationName {
  return typeof value === 'string' && Object.hasOwn(aggregationFns, value);
}

import { cn } from 'cn';

import type { AggregationMark } from '@istec/grid-core';

/** The mark of an aggregation, such as Σ, with its name as tooltip. */
export function AggregationSymbol({ mark, className }: { mark: AggregationMark | undefined; className?: string }) {
  if (!mark) return null;
  return (
    <abbr
      title={mark.name}
      aria-label={mark.name}
      className={cn('font-normal text-muted-foreground no-underline', className)}
    >
      {mark.symbol}
    </abbr>
  );
}

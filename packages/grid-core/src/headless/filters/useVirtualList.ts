import { useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * A scrolling list of `count` items of `itemHeight` that renders only those in view, up to `maxHeight` tall, such as
 * the values of a set filter. Like `useVirtualRows`, a component calling it opts out of the React Compiler.
 */
export function useVirtualList(count: number, { itemHeight, maxHeight }: { itemHeight: number; maxHeight: number }) {
  'use no memo';
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight,
    overscan: 8,
  });

  return {
    /** For the scroll container. */
    scrollProps: {
      ref: scrollRef,
      style: { height: Math.min(count * itemHeight, maxHeight), overflowY: 'auto' as const },
    },
    /** For the element inside it, positioned relative, that holds the items. */
    contentStyle: { position: 'relative' as const, height: virtualizer.getTotalSize() },
    items: virtualizer.getVirtualItems().map((item) => ({
      index: item.index,
      key: item.key,
      style: { position: 'absolute' as const, left: 0, right: 0, top: item.start, height: itemHeight },
    })),
  };
}

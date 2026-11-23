import { useEffect, useRef } from 'react';

import { useVirtualView } from '#/parts/view/useVirtualView.ts';

/**
 * A scrolling list of `count` items of `itemHeight` that renders only those in view, up to `maxHeight` tall, such as
 * the values of a set filter. `activeIndex` is scrolled into view whenever it changes.
 */
export function useVirtualList(
  count: number,
  { itemHeight, maxHeight, activeIndex }: { itemHeight: number; maxHeight: number; activeIndex?: number }
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { virtualizer, items, totalSize } = useVirtualView({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight,
    overscan: 8,
  });

  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < count) virtualizer.scrollToIndex(activeIndex);
  }, [virtualizer, activeIndex, count]);

  return {
    /** For the scroll container. */
    scrollProps: {
      ref: scrollRef,
      style: { height: Math.min(count * itemHeight, maxHeight), overflowY: 'auto' as const },
    },
    /** For the element inside it, positioned relative, that holds the items. */
    contentStyle: { position: 'relative' as const, height: totalSize },
    items: items.map((item) => ({
      index: item.index,
      key: item.key,
      style: { position: 'absolute' as const, left: 0, right: 0, top: item.start, height: itemHeight },
    })),
  };
}

/** What `useVirtualList` gives a scrolling list. */
export type VirtualListModel = ReturnType<typeof useVirtualList>;

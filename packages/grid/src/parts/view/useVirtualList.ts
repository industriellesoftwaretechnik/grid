import { useEffect, useRef } from 'react';

import { useVirtualView } from '#/parts/view/useVirtualView.ts';

/** A virtual list, such as a select editor's choices or a set filter's options; it scrolls `activeIndex` into view. */
export function useVirtualList(
  count: number,
  {
    itemHeight,
    maxHeight,
    activeIndex,
  }: {
    /** In px. */
    itemHeight: number;
    /** In px; the list is as tall as its items up to this. */
    maxHeight: number;
    activeIndex?: number;
  }
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
    /** Props for the scroll container. */
    scrollProps: {
      ref: scrollRef,
      style: { height: Math.min(count * itemHeight, maxHeight), overflowY: 'auto' as const },
    },
    /** For the element inside the scroll container that holds the items. */
    contentStyle: { position: 'relative' as const, height: totalSize },
    /** The items to render, each with the style that places it. */
    items: items.map((item) => ({
      index: item.index,
      key: item.key,
      style: { position: 'absolute' as const, left: 0, right: 0, top: item.start, height: itemHeight },
    })),
  };
}

/** What `useVirtualList` returns. */
export type VirtualListModel = ReturnType<typeof useVirtualList>;

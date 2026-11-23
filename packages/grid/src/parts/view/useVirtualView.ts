import { useSyncExternalStore } from 'react';

import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';

type Options<TScroll extends Element> = Parameters<typeof useVirtualizer<TScroll, Element>>[0];

const noSubscription = () => () => {};

// Changes whenever the items in view or their sizes do.
function positionOf<TScroll extends Element>(virtualizer: Virtualizer<TScroll, Element>): string {
  const { range, scrollOffset, scrollRect, isScrolling } = virtualizer;
  return [range?.startIndex, range?.endIndex, virtualizer.getTotalSize(), scrollOffset, scrollRect?.width, isScrolling]
    .map(String)
    .join(':');
}

function viewOf<TScroll extends Element>(
  virtualizer: Virtualizer<TScroll, Element>,
  _options: Options<TScroll>,
  position: string
) {
  return {
    position,
    items: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollOffset: virtualizer.scrollOffset ?? 0,
    viewportWidth: virtualizer.scrollRect?.width,
  };
}

/**
 * `useVirtualizer` with its current items and sizes as values. The virtualizer stays the same object while it scrolls,
 * so the React Compiler would keep what a component reads from it; its position is read as a value on every render,
 * and what depends on it is recomputed when it or the options change.
 */
export function useVirtualView<TScroll extends Element>(options: Options<TScroll>) {
  const virtualizer = useVirtualizer<TScroll, Element>(options);
  const readPosition = () => positionOf(virtualizer);
  const position = useSyncExternalStore(noSubscription, readPosition, readPosition);
  return { virtualizer, ...viewOf(virtualizer, options, position) };
}

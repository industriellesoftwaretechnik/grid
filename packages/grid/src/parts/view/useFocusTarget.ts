import { useEffect, useRef } from 'react';

// Focus follows the cell only while the grid (or the body, after the focused cell unmounted) has it.
function gridHasFocus(element: HTMLElement): boolean {
  const active = document.activeElement;
  if (active === null || active === document.body) return true;
  return element.closest('[data-grid-body]')?.contains(active) === true;
}

export function useFocusTarget<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (active && element && document.activeElement !== element && gridHasFocus(element)) {
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [active]);
  return ref;
}

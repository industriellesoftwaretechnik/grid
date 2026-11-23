import { useEffect, useRef } from 'react';

// Focus follows the focused cell only while the grid has it, so a re-render never pulls focus from a search input.
// When the focused cell scrolled out of view and unmounted, focus fell back to the body and returns here.
function gridHasFocus(element: HTMLElement): boolean {
  const active = document.activeElement;
  if (active === null || active === document.body) return true;
  return element.closest('[data-grid-body]')?.contains(active) === true;
}

/** A ref that takes DOM focus whenever `active` turns true. */
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

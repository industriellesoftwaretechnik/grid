import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { gridDefaults } from '#/defaults.ts';

// A document-wide rule, so the cursor holds over buttons with their own cursor and once the pointer leaves the dragged
// item. It is a style element rather than a class, so it needs no stylesheet from the UI layer.
let grabbingStyle: HTMLStyleElement | undefined;
const grab = () => {
  grabbingStyle ??= Object.assign(document.createElement('style'), { textContent: '*{cursor:grabbing!important}' });
  document.head.append(grabbingStyle);
};
const release = () => grabbingStyle?.remove();

/** Sensors and handlers for a `DndContext` that reorders columns. */
export function useColumnDragAndDrop(onDrop: (event: DragEndEvent) => void) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: gridDefaults.dragDistance } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return {
    sensors,
    onDragStart: grab,
    onDragCancel: release,
    onDragEnd: (event: DragEndEvent) => {
      release();
      onDrop(event);
    },
  };
}

import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/** The droppable id of the group panel among the headers. */
export const groupPanelId = 'group-panel';

/** Pixels a press must move to start dragging, so a click on a header still sorts. */
const dragDistance = 5;

// A document-wide rule, so the cursor holds over buttons with their own cursor and once the pointer leaves the item.
let grabbingStyle: HTMLStyleElement | undefined;
const grab = () => {
  grabbingStyle ??= Object.assign(document.createElement('style'), { textContent: '*{cursor:grabbing!important}' });
  document.head.append(grabbingStyle);
};
const release = () => grabbingStyle?.remove();

/** Sensors and handlers for a `DndContext` of columns: a press must move a few pixels, so a click still sorts. */
export function useColumnDragAndDrop(onDrop: (event: DragEndEvent) => void) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: dragDistance } }),
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

import type { ReactNode, Ref } from 'react';

/** The full-width row under a master row. Its content stays in view while the columns scroll sideways. */
export function DetailRow({
  index,
  measureRef,
  colSpan,
  width,
  children,
}: {
  index: number;
  measureRef: Ref<HTMLTableRowElement>;
  colSpan: number;
  /** The width of the viewport. */
  width: number | undefined;
  children: ReactNode;
}) {
  return (
    <tr data-index={index} ref={measureRef} className="ig:[&>td]:border-b">
      <td data-row-detail colSpan={colSpan} className="ig:overflow-clip ig:bg-muted/30 ig:p-0">
        <div className="ig:sticky ig:left-0 ig:p-3 ig:whitespace-normal" style={{ width }}>
          {children}
        </div>
      </td>
    </tr>
  );
}

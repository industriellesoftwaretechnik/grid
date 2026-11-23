export interface GroupChild {
  show: 'open' | 'closed' | undefined;
  /** Whether the user left at least one of its columns visible. */
  visible: boolean;
}

/**
 * AG Grid's rule: a group can be collapsed only while its visible children include one shown when open, one shown
 * when collapsed, and one that changes. Otherwise it has no toggle and shows all of them, so hiding columns can never
 * leave a group with no column and no way to bring them back.
 */
export function isExpandable(children: readonly GroupChild[]): boolean {
  const visible = children.filter((child) => child.visible);
  return (
    visible.some((child) => child.show !== 'closed') &&
    visible.some((child) => child.show !== 'open') &&
    visible.some((child) => child.show !== undefined)
  );
}

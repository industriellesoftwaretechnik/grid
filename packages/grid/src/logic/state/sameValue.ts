function isPlainObject(value: object): value is Record<string, unknown> {
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Whether two values look the same: equal, or arrays and plain objects whose items are, up to `depth` levels down.
 * Rows, cells, columns and other class-like objects compare by identity.
 */
export function sameValue(a: unknown, b: unknown, depth = 6): boolean {
  if (Object.is(a, b)) return true;
  if (depth === 0 || typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => sameValue(item, b[index], depth - 1))
    );
  }
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && sameValue(a[key], b[key], depth - 1))
  );
}

/** Whether two values are equal, or objects whose own values are. */
export function sameShallow(a: unknown, b: unknown): boolean {
  return sameValue(a, b, 1);
}

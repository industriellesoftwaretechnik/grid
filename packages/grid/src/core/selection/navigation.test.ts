import { describe, expect, it } from 'vite-plus/test';

import { keyToMove, moveFocus, type FocusMove } from '#/core/selection/navigation.ts';

const rows = ['r1', 'r2', 'r3'];
const columns = ['a', 'b'];
const move = (rowId: string, columnId: string, to: FocusMove) => moveFocus(rows, columns, { rowId, columnId }, to, 2);

describe('moveFocus', () => {
  it('moves one step and stops at the edges', () => {
    expect(move('r1', 'a', 'down')).toEqual({ rowId: 'r2', columnId: 'a' });
    expect(move('r1', 'a', 'up')).toEqual({ rowId: 'r1', columnId: 'a' });
    expect(move('r1', 'b', 'right')).toEqual({ rowId: 'r1', columnId: 'b' });
  });

  it('jumps to the edges and by pages', () => {
    expect(move('r2', 'b', 'rowStart')).toEqual({ rowId: 'r2', columnId: 'a' });
    expect(move('r2', 'a', 'last')).toEqual({ rowId: 'r3', columnId: 'b' });
    expect(move('r1', 'a', 'pageDown')).toEqual({ rowId: 'r3', columnId: 'a' });
  });

  it('wraps next and previous across rows and leaves past the ends', () => {
    expect(move('r1', 'b', 'next')).toEqual({ rowId: 'r2', columnId: 'a' });
    expect(move('r2', 'a', 'previous')).toEqual({ rowId: 'r1', columnId: 'b' });
    expect(move('r3', 'b', 'next')).toBeNull();
    expect(move('r1', 'a', 'previous')).toBeNull();
  });

  it('starts at the first row when the focused row is gone', () => {
    expect(moveFocus(rows, columns, null, 'down', 2)).toEqual({ rowId: 'r1', columnId: 'a' });
    expect(move('gone', 'b', 'down')).toEqual({ rowId: 'r1', columnId: 'b' });
  });
});

const key = (name: string, modifiers: Partial<Record<'ctrlKey' | 'metaKey' | 'shiftKey', boolean>> = {}) =>
  keyToMove({ key: name, ctrlKey: false, metaKey: false, shiftKey: false, ...modifiers });

describe('keyToMove', () => {
  it('maps keys and modifiers', () => {
    expect(key('ArrowDown')).toBe('down');
    expect(key('ArrowDown', { ctrlKey: true })).toBe('bottom');
    expect(key('Tab', { shiftKey: true })).toBe('previous');
    expect(key('x')).toBeUndefined();
  });
});

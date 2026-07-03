import { describe, expect, it } from 'vitest';
import { resolveRoomSlug } from '../src/formatters/room-alias.js';

describe('room alias resolution', () => {
  it('resolves drawing room aliases', () => {
    for (const input of ['drawing', 'Drawing Room', 'drawing-room', 'DRAW']) {
      expect(resolveRoomSlug(input)).toBe('drawing-room');
    }
  });

  it('resolves work room 1 aliases', () => {
    for (const input of ['work1', 'work 1', 'work room 1', 'room1', 'WR1']) {
      expect(resolveRoomSlug(input)).toBe('work-room-1');
    }
  });

  it('resolves work room 2 aliases', () => {
    for (const input of ['work2', 'work 2', 'work room 2', 'room2', 'wr2']) {
      expect(resolveRoomSlug(input)).toBe('work-room-2');
    }
  });

  it('is whitespace and case insensitive', () => {
    expect(resolveRoomSlug('  WORK   ROOM   1 ')).toBe('work-room-1');
  });

  it('returns null for unknown rooms', () => {
    expect(resolveRoomSlug('kitchen')).toBeNull();
    expect(resolveRoomSlug('')).toBeNull();
  });
});

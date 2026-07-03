/**
 * Resolve a user-typed room reference (from `!room <name>`) to a canonical slug.
 * Mirrors the backend resolver so the bot can fail fast on bad input.
 */
const ALIASES: Record<string, string> = {
  drawing: 'drawing-room',
  'drawing room': 'drawing-room',
  'drawing-room': 'drawing-room',
  draw: 'drawing-room',

  work1: 'work-room-1',
  'work 1': 'work-room-1',
  'work room 1': 'work-room-1',
  'work-room-1': 'work-room-1',
  room1: 'work-room-1',
  'room 1': 'work-room-1',
  wr1: 'work-room-1',

  work2: 'work-room-2',
  'work 2': 'work-room-2',
  'work room 2': 'work-room-2',
  'work-room-2': 'work-room-2',
  room2: 'work-room-2',
  'room 2': 'work-room-2',
  wr2: 'work-room-2',
};

export function resolveRoomSlug(input: string): string | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return null;
  if (ALIASES[normalized]) return ALIASES[normalized];
  const collapsed = normalized.replace(/[\s-]+/g, '');
  for (const [alias, slug] of Object.entries(ALIASES)) {
    if (alias.replace(/[\s-]+/g, '') === collapsed) return slug;
  }
  return null;
}

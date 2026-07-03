import { randomUUID } from 'node:crypto';
import { createDatabase, type Db } from './client.js';
import { rooms, devices } from './schema.js';
import { DEFAULT_WATTAGE, OFFICE_LAYOUT } from '../shared/constants.js';
import type { DeviceRow, RoomRow } from './schema.js';

/**
 * Idempotent seed. If rooms already exist, does nothing (so restarting the
 * backend never wipes simulator progress). Derives all counts from OFFICE_LAYOUT.
 */
export function seedDatabase(db: Db, now = new Date()): { rooms: number; devices: number } {
  const existing = db.select().from(rooms).all();
  if (existing.length > 0) {
    return { rooms: existing.length, devices: db.select().from(devices).all().length };
  }

  let deviceCount = 0;
  for (const room of OFFICE_LAYOUT) {
    const roomRow: RoomRow = { id: room.slug, slug: room.slug, name: room.name };
    db.insert(rooms).values(roomRow).run();

    const deviceRows: DeviceRow[] = [];
    for (let i = 1; i <= room.fans; i++) {
      deviceRows.push(makeDevice(roomRow.id, `Fan ${i}`, 'FAN', DEFAULT_WATTAGE.FAN, now));
    }
    for (let i = 1; i <= room.lights; i++) {
      deviceRows.push(makeDevice(roomRow.id, `Light ${i}`, 'LIGHT', DEFAULT_WATTAGE.LIGHT, now));
    }
    for (const d of deviceRows) db.insert(devices).values(d).run();
    deviceCount += deviceRows.length;
  }

  return { rooms: OFFICE_LAYOUT.length, devices: deviceCount };
}

function makeDevice(
  roomId: string,
  name: string,
  type: 'FAN' | 'LIGHT',
  nominalWattage: number,
  now: Date,
): DeviceRow {
  return {
    id: randomUUID(),
    roomId,
    name,
    type,
    nominalWattage,
    status: 'OFF',
    lastChangedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

// CLI entrypoint: `npm run seed`
const isMain = process.argv[1] && process.argv[1].endsWith('seed.ts');
if (isMain) {
  const { db } = createDatabase();
  const result = seedDatabase(db);
  console.log(`Seeded ${result.rooms} rooms and ${result.devices} devices.`);
}

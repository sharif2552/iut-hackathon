import { eq } from 'drizzle-orm';
import type { Db } from '../client.js';
import { devices, type DeviceRow } from '../schema.js';
import type { DeviceStatus } from '../../shared/constants.js';

export class DevicesRepository {
  constructor(private readonly db: Db) {}

  findAll(): DeviceRow[] {
    return this.db.select().from(devices).all();
  }

  findById(id: string): DeviceRow | undefined {
    return this.db.select().from(devices).where(eq(devices.id, id)).get();
  }

  findByRoomId(roomId: string): DeviceRow[] {
    return this.db.select().from(devices).where(eq(devices.roomId, roomId)).all();
  }

  insert(row: DeviceRow): void {
    this.db.insert(devices).values(row).run();
  }

  updateStatus(id: string, status: DeviceStatus, at: Date): void {
    this.db
      .update(devices)
      .set({ status, lastChangedAt: at, updatedAt: at })
      .where(eq(devices.id, id))
      .run();
  }

  count(): number {
    return this.findAll().length;
  }
}

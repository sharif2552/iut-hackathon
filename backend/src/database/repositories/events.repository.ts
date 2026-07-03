import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Db } from '../client.js';
import { deviceStateEvents, type DeviceStateEventRow } from '../schema.js';
import type { DeviceStatus, StateEventSource } from '../../shared/constants.js';

export class EventsRepository {
  constructor(private readonly db: Db) {}

  record(input: {
    deviceId: string;
    previousStatus: DeviceStatus;
    nextStatus: DeviceStatus;
    source: StateEventSource;
    occurredAt: Date;
  }): DeviceStateEventRow {
    const row: DeviceStateEventRow = { id: randomUUID(), ...input };
    this.db.insert(deviceStateEvents).values(row).run();
    return row;
  }

  historyForDevice(deviceId: string, limit = 50): DeviceStateEventRow[] {
    return this.db
      .select()
      .from(deviceStateEvents)
      .where(eq(deviceStateEvents.deviceId, deviceId))
      .orderBy(desc(deviceStateEvents.occurredAt))
      .limit(limit)
      .all();
  }
}

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
});

export const devices = sqliteTable('devices', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => rooms.id),
  name: text('name').notNull(),
  type: text('type', { enum: ['LIGHT', 'FAN'] }).notNull(),
  nominalWattage: integer('nominal_wattage').notNull(),
  status: text('status', { enum: ['ON', 'OFF'] })
    .notNull()
    .default('OFF'),
  lastChangedAt: integer('last_changed_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const deviceStateEvents = sqliteTable('device_state_events', {
  id: text('id').primaryKey(),
  deviceId: text('device_id')
    .notNull()
    .references(() => devices.id),
  previousStatus: text('previous_status', { enum: ['ON', 'OFF'] }).notNull(),
  nextStatus: text('next_status', { enum: ['ON', 'OFF'] }).notNull(),
  source: text('source', { enum: ['SIMULATOR', 'SYSTEM', 'DEVELOPMENT'] }).notNull(),
  occurredAt: integer('occurred_at', { mode: 'timestamp_ms' }).notNull(),
});

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  severity: text('severity', { enum: ['INFO', 'WARNING', 'CRITICAL'] }).notNull(),
  roomId: text('room_id').references(() => rooms.id),
  deviceId: text('device_id').references(() => devices.id),
  message: text('message').notNull(),
  status: text('status', { enum: ['ACTIVE', 'RESOLVED'] })
    .notNull()
    .default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }),
  deduplicationKey: text('deduplication_key').notNull(),
});

export const powerSamples = sqliteTable('power_samples', {
  id: text('id').primaryKey(),
  officeWatts: integer('office_watts').notNull(),
  drawingRoomWatts: integer('drawing_room_watts').notNull().default(0),
  workRoom1Watts: integer('work_room_1_watts').notNull().default(0),
  workRoom2Watts: integer('work_room_2_watts').notNull().default(0),
  energyWh: integer('energy_wh').notNull().default(0),
  sampledAt: integer('sampled_at', { mode: 'timestamp_ms' }).notNull(),
});

export const DDL = sql``; // placeholder to keep drizzle happy if imported

export type RoomRow = typeof rooms.$inferSelect;
export type DeviceRow = typeof devices.$inferSelect;
export type DeviceStateEventRow = typeof deviceStateEvents.$inferSelect;
export type AlertRow = typeof alerts.$inferSelect;
export type PowerSampleRow = typeof powerSamples.$inferSelect;

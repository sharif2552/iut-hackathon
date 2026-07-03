import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { config } from '../shared/config/index.js';
import * as schema from './schema.js';

/**
 * Creates tables if they do not exist. We keep a hand-written idempotent DDL
 * rather than drizzle-kit migrations so the hackathon project boots with zero
 * extra steps (`npm run dev` just works).
 */
const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  nominal_wattage INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'OFF',
  last_changed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS device_state_events (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES devices(id),
  previous_status TEXT NOT NULL,
  next_status TEXT NOT NULL,
  source TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_state_events_device ON device_state_events(device_id, occurred_at);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  room_id TEXT REFERENCES rooms(id),
  device_id TEXT REFERENCES devices(id),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at INTEGER NOT NULL,
  resolved_at INTEGER,
  deduplication_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_alerts_active_dedupe
  ON alerts(deduplication_key) WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS power_samples (
  id TEXT PRIMARY KEY,
  office_watts INTEGER NOT NULL,
  drawing_room_watts INTEGER NOT NULL DEFAULT 0,
  work_room_1_watts INTEGER NOT NULL DEFAULT 0,
  work_room_2_watts INTEGER NOT NULL DEFAULT 0,
  energy_wh INTEGER NOT NULL DEFAULT 0,
  sampled_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_power_samples_time ON power_samples(sampled_at);
`;

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export interface Database_ {
  db: Db;
  sqlite: Database.Database;
}

export function createDatabase(path = config.sqlitePath): Database_ {
  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(MIGRATION_SQL);
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

/** Device domain constants. Wattages are nominal ratings for a device that is ON. */
export const DEFAULT_WATTAGE = {
  FAN: 60,
  LIGHT: 15,
} as const;

export type DeviceType = 'LIGHT' | 'FAN';
export type DeviceStatus = 'ON' | 'OFF';
export type StateEventSource = 'SIMULATOR' | 'SYSTEM' | 'DEVELOPMENT';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'RESOLVED';

/**
 * Canonical seeded office layout: 3 rooms x (2 fans + 3 lights) = 15 devices total.
 * 15 is the confirmed count (an earlier brief mentioned "18" in error — not used anywhere).
 * No business logic hardcodes any device count — totals are always derived from the DB,
 * so the catalogue stays configurable (change this list and re-seed).
 */
export const OFFICE_LAYOUT = [
  { slug: 'drawing-room', name: 'Drawing Room', fans: 2, lights: 3 },
  { slug: 'work-room-1', name: 'Work Room 1', fans: 2, lights: 3 },
  { slug: 'work-room-2', name: 'Work Room 2', fans: 2, lights: 3 },
] as const;

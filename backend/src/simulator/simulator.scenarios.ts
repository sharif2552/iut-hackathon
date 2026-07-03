import type { DeviceRow, RoomRow } from '../database/schema.js';
import type { DeviceStatus } from '../shared/constants.js';

export const SCENARIO_NAMES = [
  'normal-working-hours',
  'lunch-break',
  'after-hours-waste',
  'room-overactive',
  'all-off',
  'high-power-usage',
] as const;

export type ScenarioName = (typeof SCENARIO_NAMES)[number];

export interface DeviceChange {
  deviceId: string;
  nextStatus: DeviceStatus;
}

export interface ScenarioContext {
  devices: DeviceRow[];
  rooms: RoomRow[];
  now: Date;
  rng: () => number;
}

export interface Scenario {
  name: ScenarioName;
  description: string;
  /** Returns a small, believable set of state changes for this tick. */
  plan(ctx: ScenarioContext): DeviceChange[];
}

const MAX_CHANGES_PER_TICK = 3;

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Nudge the fleet toward a target ON-ratio, changing at most `maxChanges` devices. */
function moveTowardRatio(
  devices: DeviceRow[],
  targetRatio: number,
  rng: () => number,
  maxChanges = MAX_CHANGES_PER_TICK,
): DeviceChange[] {
  if (devices.length === 0) return [];
  const desiredOn = Math.round(targetRatio * devices.length);
  const currentOn = devices.filter((d) => d.status === 'ON').length;
  const changes: DeviceChange[] = [];

  if (currentOn < desiredOn) {
    const off = shuffle(devices.filter((d) => d.status === 'OFF'), rng);
    for (const d of off.slice(0, Math.min(maxChanges, desiredOn - currentOn))) {
      changes.push({ deviceId: d.id, nextStatus: 'ON' });
    }
  } else if (currentOn > desiredOn) {
    const on = shuffle(devices.filter((d) => d.status === 'ON'), rng);
    for (const d of on.slice(0, Math.min(maxChanges, currentOn - desiredOn))) {
      changes.push({ deviceId: d.id, nextStatus: 'OFF' });
    }
  }
  return changes;
}

function forceStatus(devices: DeviceRow[], status: DeviceStatus): DeviceChange[] {
  return devices
    .filter((d) => d.status !== status)
    .map((d) => ({ deviceId: d.id, nextStatus: status }));
}

export const scenarios: Record<ScenarioName, Scenario> = {
  'normal-working-hours': {
    name: 'normal-working-hours',
    description: 'Devices gradually settle around ~65% ON, like a busy work day.',
    plan: (ctx) => moveTowardRatio(ctx.devices, 0.65, ctx.rng),
  },

  'lunch-break': {
    name: 'lunch-break',
    description: 'People step out; activity drops toward ~35% ON.',
    plan: (ctx) => moveTowardRatio(ctx.devices, 0.35, ctx.rng),
  },

  'after-hours-waste': {
    name: 'after-hours-waste',
    description: 'Most devices turn off, but a few are left ON to trigger alerts.',
    plan: (ctx) => {
      const on = ctx.devices.filter((d) => d.status === 'ON');
      // Keep ~3 devices deliberately ON; turn the rest off a few at a time.
      if (on.length > 3) {
        return shuffle(on, ctx.rng)
          .slice(0, MAX_CHANGES_PER_TICK)
          .map((d) => ({ deviceId: d.id, nextStatus: 'OFF' as const }));
      }
      // If almost everything is already off, leave a couple ON as "forgotten".
      if (on.length < 2) {
        const off = shuffle(ctx.devices.filter((d) => d.status === 'OFF'), ctx.rng);
        return off.slice(0, 2).map((d) => ({ deviceId: d.id, nextStatus: 'ON' as const }));
      }
      return [];
    },
  },

  'room-overactive': {
    name: 'room-overactive',
    description: 'One room is driven fully ON to demonstrate the overactive-room alert.',
    plan: (ctx) => {
      const target = ctx.rooms[0];
      if (!target) return [];
      const roomDevices = ctx.devices.filter((d) => d.roomId === target.id);
      return forceStatus(roomDevices, 'ON');
    },
  },

  'all-off': {
    name: 'all-off',
    description: 'Everything switches off, a few devices at a time.',
    plan: (ctx) => moveTowardRatio(ctx.devices, 0, ctx.rng, ctx.devices.length),
  },

  'high-power-usage': {
    name: 'high-power-usage',
    description: 'All fans switch on to push wattage above the high-usage threshold.',
    plan: (ctx) => forceStatus(ctx.devices.filter((d) => d.type === 'FAN'), 'ON'),
  },
};

export function getScenario(name: ScenarioName): Scenario {
  return scenarios[name];
}

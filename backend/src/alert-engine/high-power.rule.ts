import type { AlertRule, AlertSignal, RuleContext } from './types.js';

export const HIGH_POWER_TYPE = 'HIGH_ROOM_USAGE';

/** Warn when a room's live wattage exceeds the configurable threshold. */
export class HighPowerRule implements AlertRule {
  readonly type = HIGH_POWER_TYPE;

  evaluate(ctx: RuleContext): AlertSignal[] {
    const threshold = ctx.highRoomWattThreshold;
    if (threshold <= 0) return [];

    return ctx.rooms
      .filter((room) => room.watts > threshold)
      .map((room) => ({
        type: this.type,
        severity: 'WARNING' as const,
        roomId: room.id,
        deviceId: null,
        message: `${room.name} is drawing ${room.watts}W, above the ${threshold}W threshold.`,
        deduplicationKey: `${this.type}:${room.id}`,
      }));
  }
}

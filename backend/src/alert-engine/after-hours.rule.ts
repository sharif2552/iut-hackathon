import type { AlertRule, AlertSignal, RuleContext } from './types.js';

export const AFTER_HOURS_TYPE = 'AFTER_HOURS_WASTE';

/** True when `hour` is outside [startHour, endHour). */
export function isAfterHours(hour: number, startHour: number, endHour: number): boolean {
  return hour < startHour || hour >= endHour;
}

/**
 * Alert when devices remain ON outside configured office hours.
 * One alert per room that still has active devices.
 */
export class AfterHoursRule implements AlertRule {
  readonly type = AFTER_HOURS_TYPE;

  evaluate(ctx: RuleContext): AlertSignal[] {
    const hour = ctx.now.getHours();
    if (!isAfterHours(hour, ctx.officeStartHour, ctx.officeEndHour)) return [];

    const timeLabel = ctx.now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return ctx.rooms
      .filter((room) => room.activeDeviceCount > 0)
      .map((room) => ({
        type: this.type,
        severity: 'WARNING' as const,
        roomId: room.id,
        deviceId: null,
        message: `${room.name} still has ${room.activeDeviceCount} device(s) ON (${room.fansOn} fan(s), ${room.lightsOn} light(s), ${room.watts}W) at ${timeLabel} — outside office hours.`,
        deduplicationKey: `${this.type}:${room.id}`,
      }));
  }
}

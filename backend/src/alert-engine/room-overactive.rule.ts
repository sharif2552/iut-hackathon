import type { AlertRule, AlertSignal, RuleContext } from './types.js';

export const ROOM_OVERACTIVE_TYPE = 'ROOM_OVERACTIVE';
export const OVERACTIVE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Alert when EVERY device in a room has been ON continuously for > 2 hours.
 * The room became fully-on when its last device switched on, so we measure from
 * the most recent `lastChangedAt` among the room's devices. Auto-resolves when
 * the room is no longer fully ON (reconciler handles removal).
 */
export class RoomOveractiveRule implements AlertRule {
  readonly type = ROOM_OVERACTIVE_TYPE;

  evaluate(ctx: RuleContext): AlertSignal[] {
    const signals: AlertSignal[] = [];
    for (const room of ctx.rooms) {
      if (room.deviceCount === 0) continue;
      const allOn = room.activeDeviceCount === room.deviceCount;
      if (!allOn) continue;

      const fullyOnSince = Math.max(
        ...room.devices.map((d) => new Date(d.lastChangedAt).getTime()),
      );
      const elapsedMs = ctx.now.getTime() - fullyOnSince;
      if (elapsedMs <= OVERACTIVE_THRESHOLD_MS) continue;

      const hours = (elapsedMs / (60 * 60 * 1000)).toFixed(1);
      signals.push({
        type: this.type,
        severity: 'CRITICAL',
        roomId: room.id,
        deviceId: null,
        message: `${room.name} has had all ${room.deviceCount} devices ON for ${hours}h straight (${room.watts}W). Consider switching some off.`,
        deduplicationKey: `${this.type}:${room.id}`,
      });
    }
    return signals;
  }
}

import type { AlertSeverity } from '../shared/constants.js';
import type { RoomSummaryDto } from '../modules/office/office.types.js';

export interface AlertSignal {
  type: string;
  severity: AlertSeverity;
  roomId: string | null;
  deviceId: string | null;
  message: string;
  deduplicationKey: string;
}

export interface RuleContext {
  now: Date;
  rooms: RoomSummaryDto[];
  officeStartHour: number;
  officeEndHour: number;
  highRoomWattThreshold: number;
}

export interface AlertRule {
  /** Alert `type` value(s) this rule owns, used for auto-resolution. */
  readonly type: string;
  evaluate(ctx: RuleContext): AlertSignal[];
}

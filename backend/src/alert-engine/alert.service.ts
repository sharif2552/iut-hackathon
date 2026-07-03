import { randomUUID } from 'node:crypto';
import type { Clock } from '../shared/clock/index.js';
import { config } from '../shared/config/index.js';
import { logger } from '../shared/logger/index.js';
import type { AlertsRepository } from '../database/repositories/alerts.repository.js';
import type { AlertRow } from '../database/schema.js';
import type { RealtimeGateway } from '../modules/realtime/realtime.gateway.js';
import type { RoomSummaryDto, AlertDto } from '../modules/office/office.types.js';
import { AfterHoursRule } from './after-hours.rule.js';
import { RoomOveractiveRule } from './room-overactive.rule.js';
import { HighPowerRule } from './high-power.rule.js';
import type { AlertRule, AlertSignal } from './types.js';

export interface AlertEvaluationResult {
  created: AlertDto[];
  updated: AlertDto[];
  resolved: AlertDto[];
}

export class AlertService {
  private readonly rules: AlertRule[];
  private readonly managedTypes: Set<string>;

  constructor(
    private readonly alerts: AlertsRepository,
    private readonly clock: Clock,
    private readonly realtime: RealtimeGateway,
    rules?: AlertRule[],
  ) {
    this.rules = rules ?? [new AfterHoursRule(), new RoomOveractiveRule(), new HighPowerRule()];
    this.managedTypes = new Set(this.rules.map((r) => r.type));
  }

  private toDto(alert: AlertRow, roomName: string | null): AlertDto {
    return {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      roomId: alert.roomId,
      roomName,
      deviceId: alert.deviceId,
      message: alert.message,
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt ? alert.resolvedAt.toISOString() : null,
    };
  }

  /**
   * Deterministic evaluation. Creates alerts for new signals (deduped) and
   * auto-resolves managed alerts whose condition no longer holds.
   */
  evaluate(rooms: RoomSummaryDto[]): AlertEvaluationResult {
    const now = this.clock.now();
    const roomNameById = new Map(rooms.map((r) => [r.id, r.name]));

    const signals: AlertSignal[] = this.rules.flatMap((rule) =>
      rule.evaluate({
        now,
        rooms,
        officeStartHour: config.OFFICE_START_HOUR,
        officeEndHour: config.OFFICE_END_HOUR,
        highRoomWattThreshold: config.HIGH_ROOM_WATT_THRESHOLD,
      }),
    );
    const desiredKeys = new Set(signals.map((s) => s.deduplicationKey));

    const created: AlertDto[] = [];
    const updated: AlertDto[] = [];
    for (const signal of signals) {
      const existing = this.alerts.findActiveByDedupe(signal.deduplicationKey);
      if (existing) {
        // Already active (dedupe: no new alert, no re-notify) — but keep the
        // message/severity in sync with live numbers so it never goes stale.
        if (existing.message !== signal.message || existing.severity !== signal.severity) {
          this.alerts.refresh(existing.id, signal.message, signal.severity);
          updated.push(
            this.toDto(
              { ...existing, message: signal.message, severity: signal.severity },
              signal.roomId ? (roomNameById.get(signal.roomId) ?? null) : null,
            ),
          );
        }
        continue;
      }
      const row: AlertRow = {
        id: randomUUID(),
        type: signal.type,
        severity: signal.severity,
        roomId: signal.roomId,
        deviceId: signal.deviceId,
        message: signal.message,
        status: 'ACTIVE',
        createdAt: now,
        resolvedAt: null,
        deduplicationKey: signal.deduplicationKey,
      };
      this.alerts.insert(row);
      const dto = this.toDto(row, signal.roomId ? (roomNameById.get(signal.roomId) ?? null) : null);
      created.push(dto);
      this.realtime.emit('alert:created', dto);
      logger.info({ type: dto.type, room: dto.roomName }, 'alert created');
    }

    const resolved: AlertDto[] = [];
    for (const active of this.alerts.findActive()) {
      if (!this.managedTypes.has(active.type)) continue;
      if (desiredKeys.has(active.deduplicationKey)) continue;
      this.alerts.resolve(active.id, now);
      const dto = this.toDto(
        { ...active, status: 'RESOLVED', resolvedAt: now },
        active.roomId ? (roomNameById.get(active.roomId) ?? null) : null,
      );
      resolved.push(dto);
      this.realtime.emit('alert:resolved', dto);
      logger.info({ type: dto.type, room: dto.roomName }, 'alert resolved');
    }

    return { created, updated, resolved };
  }
}

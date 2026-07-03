import type { OfficeService } from '../office/office.service.js';
import type { AlertDto } from '../office/office.types.js';
import type { ComposedMessage, MessageComposer } from './message-composer.interface.js';
import type { StatusFacts, RoomFacts, UsageFacts, AlertFacts } from './ai.schemas.js';

/**
 * Bridges verified office facts to the message composer. This is the ONLY place
 * that hands facts to Groq — Groq never touches the DB or decides truth.
 */
export class AssistantService {
  constructor(
    private readonly office: OfficeService,
    private readonly composer: MessageComposer,
  ) {}

  async statusMessage(): Promise<{ facts: StatusFacts; composed: ComposedMessage }> {
    const summary = this.office.buildSummary();
    const facts: StatusFacts = {
      kind: 'status',
      officeWatts: summary.officeWatts,
      todayKwh: summary.todayKwh,
      activeDevices: summary.activeDevices,
      totalDevices: summary.totalDevices,
      activeAlertCount: summary.activeAlertCount,
      rooms: summary.rooms.map((r) => ({
        name: r.name,
        watts: r.watts,
        fansOn: r.fansOn,
        fansTotal: r.fansTotal,
        lightsOn: r.lightsOn,
        lightsTotal: r.lightsTotal,
      })),
      topAlerts: summary.activeAlerts.slice(0, 3).map((a) => a.message),
    };
    return { facts, composed: await this.composer.composeStatusMessage(facts) };
  }

  async roomMessage(
    slug: string,
  ): Promise<{ facts: RoomFacts; composed: ComposedMessage } | null> {
    const room = this.office.getRoomBySlug(slug);
    if (!room) return null;
    const facts: RoomFacts = {
      kind: 'room',
      name: room.name,
      watts: room.watts,
      fansOn: room.fansOn,
      fansTotal: room.fansTotal,
      lightsOn: room.lightsOn,
      lightsTotal: room.lightsTotal,
      devices: room.devices.map((d) => ({ name: d.name, status: d.status, watts: d.currentWatts })),
      alerts: this.office
        .listActiveAlerts()
        .filter((a) => a.roomId === room.id)
        .map((a) => a.message),
    };
    return { facts, composed: await this.composer.composeRoomMessage(facts) };
  }

  async usageMessage(): Promise<{ facts: UsageFacts; composed: ComposedMessage }> {
    const summary = this.office.buildSummary();
    const facts: UsageFacts = {
      kind: 'usage',
      officeWatts: summary.officeWatts,
      todayKwh: summary.todayKwh,
      activeDevices: summary.activeDevices,
      totalDevices: summary.totalDevices,
      highestRoom: summary.highestConsumingRoom
        ? { name: summary.highestConsumingRoom.name, watts: summary.highestConsumingRoom.watts }
        : null,
    };
    return { facts, composed: await this.composer.composeUsageMessage(facts) };
  }

  async alertMessage(alert: AlertDto): Promise<ComposedMessage> {
    const facts: AlertFacts = {
      kind: 'alert',
      message: alert.message,
      severity: alert.severity,
      roomName: alert.roomName,
      createdAt: alert.createdAt,
    };
    return this.composer.composeAlertMessage(facts);
  }
}

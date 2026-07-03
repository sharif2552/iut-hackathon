import type { Clock } from '../../shared/clock/index.js';
import type { AlertRow, DeviceRow, RoomRow } from '../../database/schema.js';
import type { RoomsRepository } from '../../database/repositories/rooms.repository.js';
import type { DevicesRepository } from '../../database/repositories/devices.repository.js';
import type { AlertsRepository } from '../../database/repositories/alerts.repository.js';
import type { PowerRepository } from '../../database/repositories/power.repository.js';
import { deviceWatts, sumWatts, whToKwh } from '../energy/power.service.js';
import type {
  AlertDto,
  DeviceDto,
  EnergyDto,
  OfficeSummaryDto,
  RoomSummaryDto,
} from './office.types.js';

export class OfficeService {
  constructor(
    private readonly rooms: RoomsRepository,
    private readonly devices: DevicesRepository,
    private readonly alerts: AlertsRepository,
    private readonly power: PowerRepository,
    private readonly clock: Clock,
  ) {}

  private roomNameById(): Map<string, RoomRow> {
    return new Map(this.rooms.findAll().map((r) => [r.id, r]));
  }

  toDeviceDto(device: DeviceRow, roomName: string): DeviceDto {
    return {
      id: device.id,
      roomId: device.roomId,
      roomName,
      name: device.name,
      type: device.type,
      status: device.status,
      nominalWattage: device.nominalWattage,
      currentWatts: deviceWatts(device),
      lastChangedAt: device.lastChangedAt.toISOString(),
    };
  }

  toAlertDto(alert: AlertRow, roomName: string | null): AlertDto {
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

  buildRoomSummary(room: RoomRow, activeAlerts: AlertRow[]): RoomSummaryDto {
    const roomDevices = this.devices.findByRoomId(room.id);
    const fans = roomDevices.filter((d) => d.type === 'FAN');
    const lights = roomDevices.filter((d) => d.type === 'LIGHT');
    return {
      id: room.id,
      slug: room.slug,
      name: room.name,
      watts: sumWatts(roomDevices),
      deviceCount: roomDevices.length,
      activeDeviceCount: roomDevices.filter((d) => d.status === 'ON').length,
      fansOn: fans.filter((d) => d.status === 'ON').length,
      fansTotal: fans.length,
      lightsOn: lights.filter((d) => d.status === 'ON').length,
      lightsTotal: lights.length,
      devices: roomDevices.map((d) => this.toDeviceDto(d, room.name)),
      activeAlertCount: activeAlerts.filter((a) => a.roomId === room.id).length,
    };
  }

  startOfToday(): Date {
    const now = this.clock.now();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  getEnergy(): EnergyDto {
    const rooms = this.rooms.findAll();
    const officeWatts = sumWatts(this.devices.findAll());
    const todayWh = this.power.energyWhSince(this.startOfToday());
    return {
      officeWatts,
      todayWh,
      todayKwh: Number(whToKwh(todayWh).toFixed(3)),
      rooms: rooms.map((r) => ({
        slug: r.slug,
        name: r.name,
        watts: sumWatts(this.devices.findByRoomId(r.id)),
      })),
    };
  }

  buildSummary(): OfficeSummaryDto {
    const rooms = this.rooms.findAll();
    const allDevices = this.devices.findAll();
    const activeAlerts = this.alerts.findActive();
    const roomMap = this.roomNameById();

    const roomSummaries = rooms.map((r) => this.buildRoomSummary(r, activeAlerts));
    const officeWatts = sumWatts(allDevices);
    const todayWh = this.power.energyWhSince(this.startOfToday());

    const highest = [...roomSummaries].sort((a, b) => b.watts - a.watts)[0];
    const highestConsumingRoom =
      highest && highest.watts > 0
        ? { slug: highest.slug, name: highest.name, watts: highest.watts }
        : null;

    return {
      generatedAt: this.clock.now().toISOString(),
      officeWatts,
      todayKwh: Number(whToKwh(todayWh).toFixed(3)),
      totalDevices: allDevices.length,
      activeDevices: allDevices.filter((d) => d.status === 'ON').length,
      totalRooms: rooms.length,
      activeAlertCount: activeAlerts.length,
      highestConsumingRoom,
      rooms: roomSummaries,
      activeAlerts: activeAlerts.map((a) =>
        this.toAlertDto(a, a.roomId ? (roomMap.get(a.roomId)?.name ?? null) : null),
      ),
    };
  }

  getRoomBySlug(slug: string): RoomSummaryDto | undefined {
    const room = this.rooms.findBySlug(slug);
    if (!room) return undefined;
    return this.buildRoomSummary(room, this.alerts.findActive());
  }

  getDevice(deviceId: string): DeviceDto | undefined {
    const device = this.devices.findById(deviceId);
    if (!device) return undefined;
    const room = this.rooms.findById(device.roomId);
    return this.toDeviceDto(device, room?.name ?? 'Unknown');
  }

  listDevices(): DeviceDto[] {
    const roomMap = this.roomNameById();
    return this.devices
      .findAll()
      .map((d) => this.toDeviceDto(d, roomMap.get(d.roomId)?.name ?? 'Unknown'));
  }

  listActiveAlerts(): AlertDto[] {
    const roomMap = this.roomNameById();
    return this.alerts
      .findActive()
      .map((a) => this.toAlertDto(a, a.roomId ? (roomMap.get(a.roomId)?.name ?? null) : null));
  }

  listRecentAlerts(limit = 50): AlertDto[] {
    const roomMap = this.roomNameById();
    return this.alerts
      .findRecent(limit)
      .map((a) => this.toAlertDto(a, a.roomId ? (roomMap.get(a.roomId)?.name ?? null) : null));
  }
}

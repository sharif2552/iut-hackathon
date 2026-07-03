import type { AlertSeverity, AlertStatus, DeviceStatus, DeviceType } from '../../shared/constants.js';

export interface DeviceDto {
  id: string;
  roomId: string;
  roomName: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  nominalWattage: number;
  currentWatts: number;
  lastChangedAt: string;
}

export interface RoomSummaryDto {
  id: string;
  slug: string;
  name: string;
  watts: number;
  deviceCount: number;
  activeDeviceCount: number;
  fansOn: number;
  fansTotal: number;
  lightsOn: number;
  lightsTotal: number;
  devices: DeviceDto[];
  activeAlertCount: number;
}

export interface AlertDto {
  id: string;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  roomId: string | null;
  roomName: string | null;
  deviceId: string | null;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface EnergyDto {
  officeWatts: number;
  todayKwh: number;
  todayWh: number;
  rooms: { slug: string; name: string; watts: number }[];
}

export interface OfficeSummaryDto {
  generatedAt: string;
  officeWatts: number;
  todayKwh: number;
  totalDevices: number;
  activeDevices: number;
  totalRooms: number;
  activeAlertCount: number;
  highestConsumingRoom: { slug: string; name: string; watts: number } | null;
  rooms: RoomSummaryDto[];
  activeAlerts: AlertDto[];
}

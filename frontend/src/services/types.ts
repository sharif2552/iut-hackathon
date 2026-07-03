export type DeviceType = 'LIGHT' | 'FAN';
export type DeviceStatus = 'ON' | 'OFF';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'RESOLVED';

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

export interface EnergyPoint {
  officeWatts: number;
  drawingRoomWatts: number;
  workRoom1Watts: number;
  workRoom2Watts: number;
  energyWh: number;
  sampledAt: string;
}

export interface EnergyResponse {
  officeWatts: number;
  todayKwh: number;
  todayWh: number;
  rooms: { slug: string; name: string; watts: number }[];
  samples: EnergyPoint[];
}

export interface AlertsResponse {
  active: AlertDto[];
  recent: AlertDto[];
}

export type SimulatorState = {
  running: boolean;
  scenario: string;
  intervalMs: number;
  updatedAt: string;
};

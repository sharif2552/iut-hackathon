import type { AlertDto, DeviceDto, OfficeSummaryDto, RoomSummaryDto } from '../office/office.types.js';

export interface EnergySampleEvent {
  officeWatts: number;
  todayKwh: number;
  sampledAt: string;
  rooms: { slug: string; watts: number }[];
}

export interface SimulatorStatusEvent {
  running: boolean;
  scenario: string;
  intervalMs: number;
  updatedAt: string;
}

/** Server -> client Socket.IO event map. */
export interface ServerToClientEvents {
  'office:summary.updated': (summary: OfficeSummaryDto) => void;
  'device:updated': (device: DeviceDto) => void;
  'room:updated': (room: RoomSummaryDto) => void;
  'energy:sample.created': (sample: EnergySampleEvent) => void;
  'alert:created': (alert: AlertDto) => void;
  'alert:resolved': (alert: AlertDto) => void;
  'simulator:status.updated': (status: SimulatorStatusEvent) => void;
}

export type RealtimeEventName = keyof ServerToClientEvents;

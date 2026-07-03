import type { Clock } from '../shared/clock/index.js';
import { config } from '../shared/config/index.js';
import { logger } from '../shared/logger/index.js';
import type { DevicesRepository } from '../database/repositories/devices.repository.js';
import type { RoomsRepository } from '../database/repositories/rooms.repository.js';
import type { EventsRepository } from '../database/repositories/events.repository.js';
import type { PowerRepository } from '../database/repositories/power.repository.js';
import type { OfficeService } from '../modules/office/office.service.js';
import type { AlertService } from '../alert-engine/alert.service.js';
import type { RealtimeGateway } from '../modules/realtime/realtime.gateway.js';
import { incrementalEnergyWh, sumWatts, whToKwh } from '../modules/energy/power.service.js';
import type { DeviceStatus, StateEventSource } from '../shared/constants.js';
import {
  getScenario,
  type DeviceChange,
  type ScenarioName,
} from './simulator.scenarios.js';

export interface SimulatorState {
  running: boolean;
  scenario: ScenarioName;
  intervalMs: number;
  updatedAt: string;
}

export class SimulatorService {
  private running = false;
  private scenario: ScenarioName = 'normal-working-hours';
  private rng: () => number = Math.random;

  constructor(
    private readonly devices: DevicesRepository,
    private readonly rooms: RoomsRepository,
    private readonly events: EventsRepository,
    private readonly power: PowerRepository,
    private readonly office: OfficeService,
    private readonly alerts: AlertService,
    private readonly realtime: RealtimeGateway,
    private readonly clock: Clock,
  ) {}

  getState(): SimulatorState {
    return {
      running: this.running,
      scenario: this.scenario,
      intervalMs: config.SIMULATOR_INTERVAL_MS,
      updatedAt: this.clock.now().toISOString(),
    };
  }

  private emitStatus(): void {
    this.realtime.emit('simulator:status.updated', this.getState());
  }

  setRunning(running: boolean): SimulatorState {
    this.running = running;
    logger.info({ running }, 'simulator running state changed');
    this.emitStatus();
    return this.getState();
  }

  setScenario(name: ScenarioName): SimulatorState {
    this.scenario = name;
    logger.info({ scenario: name }, 'simulator scenario changed');
    this.emitStatus();
    return this.getState();
  }

  /** Apply a set of device changes, persisting state + events and emitting updates. */
  private applyChanges(changes: DeviceChange[], source: StateEventSource): void {
    const now = this.clock.now();
    for (const change of changes) {
      const device = this.devices.findById(change.deviceId);
      if (!device || device.status === change.nextStatus) continue;
      const previousStatus = device.status;
      this.devices.updateStatus(device.id, change.nextStatus, now);
      this.events.record({
        deviceId: device.id,
        previousStatus,
        nextStatus: change.nextStatus,
        source,
        occurredAt: now,
      });
      const dto = this.office.getDevice(device.id);
      if (dto) this.realtime.emit('device:updated', dto);
    }
  }

  /** Persist a fresh power sample and emit the energy event. */
  private recordPower(): void {
    const now = this.clock.now();
    const allDevices = this.devices.findAll();
    const officeWatts = sumWatts(allDevices);

    const previous = this.power.latest();
    const previousWatts = previous ? previous.officeWatts : officeWatts;
    const elapsedMs = previous
      ? now.getTime() - previous.sampledAt.getTime()
      : config.SIMULATOR_INTERVAL_MS;
    const energyWh = Math.round(incrementalEnergyWh(previousWatts, officeWatts, elapsedMs));

    const wattsForSlug = (slug: string): number =>
      sumWatts(
        allDevices.filter((d) => this.rooms.findById(d.roomId)?.slug === slug),
      );

    this.power.insert({
      officeWatts,
      drawingRoomWatts: wattsForSlug('drawing-room'),
      workRoom1Watts: wattsForSlug('work-room-1'),
      workRoom2Watts: wattsForSlug('work-room-2'),
      energyWh,
      sampledAt: now,
    });

    const todayWh = this.power.energyWhSince(this.office.startOfToday());
    this.realtime.emit('energy:sample.created', {
      officeWatts,
      todayKwh: Number(whToKwh(todayWh).toFixed(3)),
      sampledAt: now.toISOString(),
      rooms: this.rooms
        .findAll()
        .map((r) => ({ slug: r.slug, watts: sumWatts(this.devices.findByRoomId(r.id)) })),
    });
  }

  /** Run one simulation tick end-to-end. Also used directly by tests. */
  tick(source: StateEventSource = 'SIMULATOR'): void {
    const scenario = getScenario(this.scenario);
    const changes = scenario.plan({
      devices: this.devices.findAll(),
      rooms: this.rooms.findAll(),
      now: this.clock.now(),
      rng: this.rng,
    });
    this.applyChanges(changes, source);
    this.recordPower();
    this.evaluateAlertsAndBroadcast();
  }

  /**
   * Run the alert engine against current state, then broadcast a summary built
   * AFTER evaluation — so emitted alert messages/counts are never stale.
   */
  private evaluateAlertsAndBroadcast(): void {
    this.alerts.evaluate(this.office.buildSummary().rooms);
    const summary = this.office.buildSummary();
    this.realtime.emit('office:summary.updated', summary);
    // Emit per-room updates so map/panels stay in sync.
    for (const room of summary.rooms) this.realtime.emit('room:updated', room);
  }

  /** Manually toggle a single device (dev endpoint). */
  toggleDevice(deviceId: string, source: StateEventSource = 'DEVELOPMENT'): boolean {
    const device = this.devices.findById(deviceId);
    if (!device) return false;
    const nextStatus: DeviceStatus = device.status === 'ON' ? 'OFF' : 'ON';
    this.applyChanges([{ deviceId, nextStatus }], source);
    this.recordPower();
    this.evaluateAlertsAndBroadcast();
    return true;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Test hook: inject a deterministic RNG. */
  setRng(rng: () => number): void {
    this.rng = rng;
  }
}

import type { Clock } from './shared/clock/index.js';
import { systemClock } from './shared/clock/index.js';
import { createDatabase, type Database_ } from './database/client.js';
import { seedDatabase } from './database/seed.js';
import { RoomsRepository } from './database/repositories/rooms.repository.js';
import { DevicesRepository } from './database/repositories/devices.repository.js';
import { EventsRepository } from './database/repositories/events.repository.js';
import { AlertsRepository } from './database/repositories/alerts.repository.js';
import { PowerRepository } from './database/repositories/power.repository.js';
import { OfficeService } from './modules/office/office.service.js';
import { AlertService } from './alert-engine/alert.service.js';
import { RealtimeGateway } from './modules/realtime/realtime.gateway.js';
import { SimulatorService } from './simulator/simulator.service.js';
import { SimulatorScheduler } from './simulator/simulator.scheduler.js';
import { AssistantService } from './modules/ai/assistant.service.js';
import { createMessageComposer } from './modules/ai/groq-message-composer.js';

export interface Container {
  database: Database_;
  clock: Clock;
  realtime: RealtimeGateway;
  repositories: {
    rooms: RoomsRepository;
    devices: DevicesRepository;
    events: EventsRepository;
    alerts: AlertsRepository;
    power: PowerRepository;
  };
  office: OfficeService;
  alerts: AlertService;
  simulator: SimulatorService;
  scheduler: SimulatorScheduler;
  assistant: AssistantService;
}

export function createContainer(options?: {
  database?: Database_;
  clock?: Clock;
  realtime?: RealtimeGateway;
  seed?: boolean;
}): Container {
  const clock = options?.clock ?? systemClock;
  const database = options?.database ?? createDatabase();
  const realtime = options?.realtime ?? new RealtimeGateway();

  if (options?.seed !== false) seedDatabase(database.db, clock.now());

  const rooms = new RoomsRepository(database.db);
  const devices = new DevicesRepository(database.db);
  const events = new EventsRepository(database.db);
  const alertsRepo = new AlertsRepository(database.db);
  const power = new PowerRepository(database.db);

  const office = new OfficeService(rooms, devices, alertsRepo, power, clock);
  const alerts = new AlertService(alertsRepo, clock, realtime);
  const simulator = new SimulatorService(
    devices,
    rooms,
    events,
    power,
    office,
    alerts,
    realtime,
    clock,
  );
  const scheduler = new SimulatorScheduler(simulator);
  const assistant = new AssistantService(office, createMessageComposer());

  return {
    database,
    clock,
    realtime,
    repositories: { rooms, devices, events, alerts: alertsRepo, power },
    office,
    alerts,
    simulator,
    scheduler,
    assistant,
  };
}

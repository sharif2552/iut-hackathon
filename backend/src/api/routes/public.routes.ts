import type { FastifyInstance } from 'fastify';
import type { Container } from '../../container.js';
import { NotFoundError } from '../../shared/errors/index.js';

export function registerPublicRoutes(app: FastifyInstance, c: Container): void {
  app.get('/health', async () => ({
    status: 'ok',
    time: c.clock.now().toISOString(),
    simulator: c.simulator.getState(),
    realtimeClients: c.realtime.clientCount,
  }));

  app.get('/api/v1/office/summary', async () => c.office.buildSummary());

  app.get('/api/v1/rooms', async () => ({
    rooms: c.office.buildSummary().rooms,
  }));

  app.get<{ Params: { roomSlug: string } }>('/api/v1/rooms/:roomSlug', async (req) => {
    const room = c.office.getRoomBySlug(req.params.roomSlug);
    if (!room) throw new NotFoundError(`Room '${req.params.roomSlug}' not found`);
    return room;
  });

  app.get('/api/v1/devices', async () => ({ devices: c.office.listDevices() }));

  app.get<{ Params: { deviceId: string } }>('/api/v1/devices/:deviceId', async (req) => {
    const device = c.office.getDevice(req.params.deviceId);
    if (!device) throw new NotFoundError(`Device '${req.params.deviceId}' not found`);
    return device;
  });

  app.get<{ Params: { deviceId: string } }>(
    '/api/v1/devices/:deviceId/history',
    async (req) => {
      const device = c.office.getDevice(req.params.deviceId);
      if (!device) throw new NotFoundError(`Device '${req.params.deviceId}' not found`);
      const history = c.repositories.events.historyForDevice(req.params.deviceId).map((e) => ({
        id: e.id,
        previousStatus: e.previousStatus,
        nextStatus: e.nextStatus,
        source: e.source,
        occurredAt: e.occurredAt.toISOString(),
      }));
      return { device, history };
    },
  );

  app.get('/api/v1/alerts', async () => ({
    active: c.office.listActiveAlerts(),
    recent: c.office.listRecentAlerts(50),
  }));

  app.get('/api/v1/energy', async () => {
    const energy = c.office.getEnergy();
    const samples = c.repositories.power.since(c.office.startOfToday()).map((s) => ({
      officeWatts: s.officeWatts,
      drawingRoomWatts: s.drawingRoomWatts,
      workRoom1Watts: s.workRoom1Watts,
      workRoom2Watts: s.workRoom2Watts,
      energyWh: s.energyWh,
      sampledAt: s.sampledAt.toISOString(),
    }));
    return { ...energy, samples };
  });
}

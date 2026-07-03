import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Container } from '../../container.js';
import { NotFoundError, ValidationError } from '../../shared/errors/index.js';
import { SCENARIO_NAMES, type ScenarioName } from '../../simulator/simulator.scenarios.js';

const scenarioParam = z.enum(SCENARIO_NAMES);

export function registerDevRoutes(app: FastifyInstance, c: Container): void {
  app.post('/api/v1/dev/simulator/start', async () => c.simulator.setRunning(true));
  app.post('/api/v1/dev/simulator/stop', async () => c.simulator.setRunning(false));

  app.post<{ Params: { scenarioName: string } }>(
    '/api/v1/dev/scenarios/:scenarioName',
    async (req) => {
      const parsed = scenarioParam.safeParse(req.params.scenarioName);
      if (!parsed.success) {
        throw new ValidationError(
          `Unknown scenario. Valid: ${SCENARIO_NAMES.join(', ')}`,
        );
      }
      const state = c.simulator.setScenario(parsed.data as ScenarioName);
      // Immediately run a tick so the demo reflects the scenario without waiting.
      c.simulator.tick();
      return { ...state, appliedImmediately: true };
    },
  );

  app.post<{ Params: { deviceId: string } }>(
    '/api/v1/dev/devices/:deviceId/toggle',
    async (req) => {
      const ok = c.simulator.toggleDevice(req.params.deviceId);
      if (!ok) throw new NotFoundError(`Device '${req.params.deviceId}' not found`);
      return c.office.getDevice(req.params.deviceId);
    },
  );
}

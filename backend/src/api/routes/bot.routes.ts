import type { FastifyInstance } from 'fastify';
import type { Container } from '../../container.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { resolveRoomSlug } from '../../modules/rooms/room-alias.js';

/**
 * Internal endpoints for the Discord bot. They return BOTH the verified facts
 * and a ready-to-send friendly `message` (Groq wording or template fallback).
 * The bot may use `message` directly or re-render from `facts`.
 */
export function registerBotRoutes(app: FastifyInstance, c: Container): void {
  app.get('/api/v1/internal/bot/status', async () => {
    const { facts, composed } = await c.assistant.statusMessage();
    return { message: composed.message, source: composed.source, facts };
  });

  app.get<{ Params: { roomSlug: string } }>(
    '/api/v1/internal/bot/room/:roomSlug',
    async (req) => {
      const slug = resolveRoomSlug(req.params.roomSlug) ?? req.params.roomSlug;
      const result = await c.assistant.roomMessage(slug);
      if (!result) throw new NotFoundError(`Room '${req.params.roomSlug}' not found`);
      return { message: result.composed.message, source: result.composed.source, facts: result.facts };
    },
  );

  app.get('/api/v1/internal/bot/usage', async () => {
    const { facts, composed } = await c.assistant.usageMessage();
    return { message: composed.message, source: composed.source, facts };
  });

  app.get('/api/v1/internal/bot/alerts', async () => {
    const active = c.office.listActiveAlerts();
    return { count: active.length, alerts: active };
  });
}

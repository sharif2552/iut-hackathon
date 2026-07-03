import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from './shared/config/index.js';
import { AppError } from './shared/errors/index.js';
import type { Container } from './container.js';
import { registerPublicRoutes } from './api/routes/public.routes.js';
import { registerDevRoutes } from './api/routes/dev.routes.js';
import { registerBotRoutes } from './api/routes/bot.routes.js';

export function createApp(container: Container): FastifyInstance {
  const app = Fastify({ logger: false });

  app.register(cors, {
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(','),
  });

  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.code, message: error.message });
    }
    if ((error as { validation?: unknown }).validation) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: error.message });
    }
    reply.log.error?.(error);
    return reply.status(500).send({ error: 'INTERNAL_ERROR', message: 'Something went wrong' });
  });

  registerPublicRoutes(app, container);
  registerDevRoutes(app, container);
  registerBotRoutes(app, container);

  return app;
}

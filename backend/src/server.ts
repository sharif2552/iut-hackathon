import { config } from './shared/config/index.js';
import { logger } from './shared/logger/index.js';
import { createContainer } from './container.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  const container = createContainer();
  const app = createApp(container);

  // Attach Socket.IO to Fastify's underlying HTTP server.
  container.realtime.attach(app.server);

  container.scheduler.start();
  if (config.SIMULATOR_AUTOSTART) {
    container.simulator.setRunning(true);
    container.simulator.tick(); // seed an immediate frame of live data
  }

  await app.listen({ port: config.PORT, host: config.HOST });

  logger.info(
    { port: config.PORT, groq: config.hasGroq, autostart: config.SIMULATOR_AUTOSTART },
    `Office Energy Monitor backend listening on http://localhost:${config.PORT}`,
  );

  const shutdown = async () => {
    logger.info('shutting down');
    container.scheduler.stop();
    await app.close();
    container.database.sqlite.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.error({ err }, 'failed to start backend');
  process.exit(1);
});

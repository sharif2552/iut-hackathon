import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { config } from '../../shared/config/index.js';
import { logger } from '../../shared/logger/index.js';
import type { ServerToClientEvents } from './events.js';

/**
 * Thin wrapper around Socket.IO. The backend is the single source of truth;
 * this gateway only broadcasts already-computed facts to dashboard + bot.
 */
export class RealtimeGateway {
  private io: SocketServer<Record<string, never>, ServerToClientEvents> | null = null;

  attach(server: HttpServer): void {
    this.io = new SocketServer(server, {
      cors: { origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',') },
    });
    this.io.on('connection', (socket) => {
      logger.info({ id: socket.id }, 'realtime client connected');
      socket.on('disconnect', () => logger.info({ id: socket.id }, 'realtime client disconnected'));
    });
  }

  emit<E extends keyof ServerToClientEvents>(
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    if (!this.io) return;
    this.io.emit(event, ...args);
  }

  get clientCount(): number {
    return this.io ? this.io.engine.clientsCount : 0;
  }
}

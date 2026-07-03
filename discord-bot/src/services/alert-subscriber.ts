import { io, type Socket } from 'socket.io-client';
import { config } from '../config/index.js';
import type { AlertItem } from './backend-api.client.js';
import type { DiscordAlertService } from './discord-alert.service.js';

/**
 * Subscribes to the backend Socket.IO stream and forwards `alert:created`
 * events to Discord as proactive messages. The bot connects OUTWARD to the
 * local backend socket — no inbound endpoint, no tunnel.
 */
export class AlertSubscriber {
  private socket: Socket | null = null;

  constructor(private readonly alertService: DiscordAlertService) {}

  start(): void {
    this.socket = io(config.backendSocketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
    });

    this.socket.on('connect', () => console.log('alert subscriber connected to backend socket'));
    this.socket.on('disconnect', () => console.log('alert subscriber disconnected'));

    this.socket.on('alert:created', (alert: AlertItem) => {
      this.alertService.post(alert).catch((err) => console.error('failed to post alert', err));
    });
  }

  stop(): void {
    this.socket?.close();
    this.socket = null;
  }
}

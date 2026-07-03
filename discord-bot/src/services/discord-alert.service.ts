import { type Client, type TextBasedChannel } from 'discord.js';
import { config } from '../config/index.js';
import { proactiveAlertEmbed } from '../formatters/embeds.js';
import type { AlertItem } from './backend-api.client.js';

/** Posts proactive alert messages into the configured alert channel. */
export class DiscordAlertService {
  constructor(private readonly client: Client) {}

  async post(alert: AlertItem): Promise<void> {
    if (!config.alertChannelId) return; // no channel configured -> skip silently

    const channel = await this.client.channels
      .fetch(config.alertChannelId)
      .catch(() => null);

    if (!channel || !channel.isTextBased()) {
      console.warn('alert channel not found or not text-based:', config.alertChannelId);
      return;
    }

    await (channel as TextBasedChannel & { send: (o: unknown) => Promise<unknown> }).send({
      embeds: [proactiveAlertEmbed(alert)],
    });
  }
}

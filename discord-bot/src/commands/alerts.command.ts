import type { Command } from './types.js';
import { alertsEmbed } from '../formatters/embeds.js';

export const alertsCommand: Command = {
  name: 'alerts',
  description: 'Current active alerts with timestamps.',
  async execute({ message, api }) {
    const res = await api.alerts();
    await message.reply({ embeds: [alertsEmbed(res.alerts)] });
  },
};

import type { Command } from './types.js';
import { messageEmbed } from '../formatters/embeds.js';

export const statusCommand: Command = {
  name: 'status',
  description: 'Overall office status: rooms, fans/lights ON, usage, alerts.',
  async execute({ message, api }) {
    const res = await api.status();
    await message.reply({ embeds: [messageEmbed('🏢 Office Status', res.message, res.source)] });
  },
};

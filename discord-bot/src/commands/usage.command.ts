import type { Command } from './types.js';
import { messageEmbed } from '../formatters/embeds.js';

export const usageCommand: Command = {
  name: 'usage',
  description: 'Total office watts, today kWh, highest room, and a short insight.',
  async execute({ message, api }) {
    const res = await api.usage();
    await message.reply({ embeds: [messageEmbed('⚡ Energy Usage', res.message, res.source)] });
  },
};

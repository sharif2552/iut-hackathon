import type { Command } from './types.js';
import { messageEmbed } from '../formatters/embeds.js';
import { resolveRoomSlug } from '../formatters/room-alias.js';

export const roomCommand: Command = {
  name: 'room',
  description: 'Status of one room. Usage: !room work1 | drawing | work room 2',
  async execute({ message, args, api }) {
    const raw = args.join(' ').trim();
    if (!raw) {
      await message.reply('Usage: `!room <name>` — e.g. `!room work1`, `!room drawing`.');
      return;
    }
    const slug = resolveRoomSlug(raw);
    if (!slug) {
      await message.reply(
        `I don't recognise the room "${raw}". Try: \`drawing\`, \`work1\`, or \`work2\`.`,
      );
      return;
    }
    try {
      const res = await api.room(slug);
      await message.reply({ embeds: [messageEmbed('📍 Room Status', res.message, res.source)] });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        await message.reply(`Room "${raw}" was not found on the backend.`);
        return;
      }
      throw err;
    }
  },
};

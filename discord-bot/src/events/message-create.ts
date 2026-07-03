import type { Message } from 'discord.js';
import { config } from '../config/index.js';
import { commandMap, helpText } from '../commands/index.js';
import { BackendApiClient, BackendUnavailableError } from '../services/backend-api.client.js';

const api = new BackendApiClient();

export async function handleMessageCreate(message: Message): Promise<void> {
  // Ignore other bots (and ourselves) to avoid loops.
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const withoutPrefix = message.content.slice(config.prefix.length).trim();
  const [name, ...args] = withoutPrefix.split(/\s+/);
  const commandName = (name ?? '').toLowerCase();

  if (commandName === 'help' || commandName === '') {
    await message.reply(helpText(config.prefix));
    return;
  }

  const command = commandMap.get(commandName);
  if (!command) return; // silently ignore unknown prefixed messages

  try {
    await command.execute({ message, args, api });
  } catch (err) {
    if (err instanceof BackendUnavailableError) {
      await message.reply(`⚠️ ${err.message}`);
      return;
    }
    console.error('command failed', { command: commandName, err });
    await message.reply('Sorry, something went wrong handling that command.');
  }
}

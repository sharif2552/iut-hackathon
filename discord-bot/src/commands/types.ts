import type { Message } from 'discord.js';
import type { BackendApiClient } from '../services/backend-api.client.js';

export interface CommandContext {
  message: Message;
  args: string[];
  api: BackendApiClient;
}

export interface Command {
  name: string;
  description: string;
  execute(ctx: CommandContext): Promise<void>;
}

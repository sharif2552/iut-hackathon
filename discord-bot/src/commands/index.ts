import type { Command } from './types.js';
import { statusCommand } from './status.command.js';
import { roomCommand } from './room.command.js';
import { usageCommand } from './usage.command.js';
import { alertsCommand } from './alerts.command.js';

export const commands: Command[] = [statusCommand, roomCommand, usageCommand, alertsCommand];

export const commandMap = new Map<string, Command>(commands.map((c) => [c.name, c]));

export function helpText(prefix: string): string {
  const lines = commands.map((c) => `\`${prefix}${c.name}\` — ${c.description}`);
  return `**Office Energy Monitor bot**\n${lines.join('\n')}`;
}

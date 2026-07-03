import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv(): void {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

export const config = {
  token: process.env.DISCORD_BOT_TOKEN ?? '',
  clientId: process.env.DISCORD_CLIENT_ID ?? '',
  guildId: process.env.DISCORD_GUILD_ID ?? '',
  alertChannelId: process.env.DISCORD_ALERT_CHANNEL_ID ?? '',
  prefix: process.env.COMMAND_PREFIX ?? '!',
  backendApiUrl: process.env.BACKEND_API_URL ?? 'http://localhost:4000',
  backendSocketUrl: process.env.BACKEND_SOCKET_URL ?? 'http://localhost:4000',
} as const;

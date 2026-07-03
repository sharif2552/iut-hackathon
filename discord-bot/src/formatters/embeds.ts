import { EmbedBuilder } from 'discord.js';
import type { AlertItem } from '../services/backend-api.client.js';

const SEVERITY_COLOR: Record<string, number> = {
  INFO: 0x38bdf8,
  WARNING: 0xfbbf24,
  CRITICAL: 0xf87171,
};

/** Wrap a composed (Groq/template) message in a tidy embed. */
export function messageEmbed(title: string, message: string, source: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x38bdf8)
    .setTitle(title)
    .setDescription(message.slice(0, 4000))
    .setFooter({ text: `Office Energy Monitor · wording: ${source}` })
    .setTimestamp(new Date());
}

export function alertsEmbed(alerts: AlertItem[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(alerts.length ? 0xf87171 : 0x34d399)
    .setTitle(alerts.length ? `⚠️ ${alerts.length} active alert(s)` : '✅ No active alerts')
    .setTimestamp(new Date());

  for (const a of alerts.slice(0, 10)) {
    const time = new Date(a.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    embed.addFields({
      name: `${a.severity} · ${a.roomName ?? 'Office'} · ${time}`,
      value: a.message.slice(0, 1024),
    });
  }
  return embed;
}

export function proactiveAlertEmbed(a: {
  message: string;
  severity: string;
  roomName: string | null;
  createdAt: string;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(SEVERITY_COLOR[a.severity] ?? 0xfbbf24)
    .setTitle(a.severity === 'CRITICAL' ? '🚨 Energy alert' : '⚠️ Energy alert')
    .setDescription(a.message)
    .setFooter({ text: `Room: ${a.roomName ?? 'Office'}` })
    .setTimestamp(new Date(a.createdAt));
}

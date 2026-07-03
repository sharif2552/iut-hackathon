import type { AlertFacts, RoomFacts, StatusFacts, UsageFacts } from './ai.schemas.js';
import type { ComposedMessage, MessageComposer } from './message-composer.interface.js';

/**
 * Deterministic fallback composer. Always available (no network, no keys).
 * Produces friendly, readable Discord text purely from verified facts.
 */
export class TemplateMessageComposer implements MessageComposer {
  async composeStatusMessage(facts: StatusFacts): Promise<ComposedMessage> {
    const lines = facts.rooms.map((r) => {
      if (r.fansOn === 0 && r.lightsOn === 0) return `• ${r.name}: all off ✅`;
      return `• ${r.name}: ${r.fansOn} fan(s) ON, ${r.lightsOn} light(s) ON — ${r.watts}W`;
    });
    const alertLine =
      facts.activeAlertCount > 0
        ? `\n⚠️ ${facts.activeAlertCount} active alert(s).` +
          (facts.topAlerts.length ? ` ${facts.topAlerts[0]}` : '')
        : '\nNo active alerts. 👍';
    return {
      source: 'template',
      message:
        `**Office status** — ${facts.activeDevices}/${facts.totalDevices} devices ON, ` +
        `${facts.officeWatts}W now, ~${facts.todayKwh} kWh today.\n` +
        lines.join('\n') +
        alertLine,
    };
  }

  async composeRoomMessage(facts: RoomFacts): Promise<ComposedMessage> {
    const deviceLines = facts.devices
      .map((d) => `   - ${d.name}: ${d.status}${d.status === 'ON' ? ` (${d.watts}W)` : ''}`)
      .join('\n');
    const alertLine = facts.alerts.length
      ? `\n⚠️ ${facts.alerts.join(' | ')}`
      : '\nNo active alerts for this room.';
    return {
      source: 'template',
      message:
        `**${facts.name}** — ${facts.fansOn}/${facts.fansTotal} fans ON, ` +
        `${facts.lightsOn}/${facts.lightsTotal} lights ON, drawing ${facts.watts}W.\n` +
        deviceLines +
        alertLine,
    };
  }

  async composeUsageMessage(facts: UsageFacts): Promise<ComposedMessage> {
    const highest = facts.highestRoom
      ? `Highest-consuming room: ${facts.highestRoom.name} at ${facts.highestRoom.watts}W.`
      : 'No room is drawing power right now.';
    const insight =
      facts.officeWatts === 0
        ? 'Everything is off — nice and efficient. ✅'
        : facts.highestRoom
          ? `Tip: check ${facts.highestRoom.name} first if you want to trim usage.`
          : 'Usage looks reasonable.';
    return {
      source: 'template',
      message:
        `**Energy usage** — Total right now: ${facts.officeWatts}W. ` +
        `Today's estimated usage: ${facts.todayKwh} kWh.\n` +
        `${facts.activeDevices}/${facts.totalDevices} devices ON. ${highest}\n${insight}`,
    };
  }

  async composeAlertMessage(facts: AlertFacts): Promise<ComposedMessage> {
    const icon = facts.severity === 'CRITICAL' ? '🚨' : '⚠️';
    return { source: 'template', message: `${icon} ${facts.message}` };
  }
}

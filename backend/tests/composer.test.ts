import { describe, expect, it } from 'vitest';
import { TemplateMessageComposer } from '../src/modules/ai/template-message-composer.js';
import { GroqMessageComposer } from '../src/modules/ai/groq-message-composer.js';
import type { StatusFacts, UsageFacts } from '../src/modules/ai/ai.schemas.js';

const statusFacts: StatusFacts = {
  kind: 'status',
  officeWatts: 285,
  todayKwh: 1.2,
  activeDevices: 10,
  totalDevices: 15,
  activeAlertCount: 1,
  rooms: [
    { name: 'Drawing Room', watts: 45, fansOn: 0, fansTotal: 2, lightsOn: 3, lightsTotal: 3 },
  ],
  topAlerts: ['Work Room 2 still has devices ON after hours.'],
};

const usageFacts: UsageFacts = {
  kind: 'usage',
  officeWatts: 285,
  todayKwh: 1.2,
  activeDevices: 10,
  totalDevices: 15,
  highestRoom: { name: 'Work Room 2', watts: 150 },
};

describe('template message composer', () => {
  it('composes a status message from verified facts', async () => {
    const res = await new TemplateMessageComposer().composeStatusMessage(statusFacts);
    expect(res.source).toBe('template');
    expect(res.message).toContain('285W');
    expect(res.message).toContain('10/15');
  });

  it('composes a usage message with the highest room', async () => {
    const res = await new TemplateMessageComposer().composeUsageMessage(usageFacts);
    expect(res.source).toBe('template');
    expect(res.message).toContain('Work Room 2');
    expect(res.message).toContain('1.2 kWh');
  });
});

describe('groq fallback handling', () => {
  it('falls back to the template when no Groq keys are configured', async () => {
    // Explicitly construct with zero keys so this is deterministic regardless of
    // whether the developer has a real GROQ_API_KEY in their local .env.
    const res = await new GroqMessageComposer([]).composeStatusMessage(statusFacts);
    expect(res.source).toBe('template');
    expect(res.message.length).toBeGreaterThan(0);
  });
});

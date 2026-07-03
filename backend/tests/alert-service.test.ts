import { describe, expect, it } from 'vitest';
import { makeTestContainer } from './helpers.js';

describe('alert service reconciliation', () => {
  it('creates an after-hours alert and does not duplicate it', () => {
    // 22:00 -> after hours
    const c = makeTestContainer(new Date(2026, 0, 1, 22, 0, 0));
    const fan = c.repositories.devices.findAll().find((d) => d.type === 'FAN')!;
    c.simulator.toggleDevice(fan.id);

    c.alerts.evaluate(c.office.buildSummary().rooms);
    const firstCount = c.repositories.alerts.findActive().length;
    expect(firstCount).toBeGreaterThan(0);

    // Evaluate again — should NOT create a second identical alert.
    c.alerts.evaluate(c.office.buildSummary().rooms);
    expect(c.repositories.alerts.findActive().length).toBe(firstCount);
  });

  it('auto-resolves the alert when the condition clears', () => {
    const c = makeTestContainer(new Date(2026, 0, 1, 22, 0, 0));
    const fan = c.repositories.devices.findAll().find((d) => d.type === 'FAN')!;
    c.simulator.toggleDevice(fan.id);
    c.alerts.evaluate(c.office.buildSummary().rooms);
    expect(c.repositories.alerts.findActive().length).toBeGreaterThan(0);

    // Turn the device back off at the repository level (no implicit evaluate),
    // so the next evaluate() is the one that observes the cleared condition.
    c.repositories.devices.updateStatus(fan.id, 'OFF', c.clock.now());
    const result = c.alerts.evaluate(c.office.buildSummary().rooms);
    expect(result.resolved.length).toBeGreaterThan(0);
    expect(c.repositories.alerts.findActive().length).toBe(0);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { makeTestContainer } from './helpers.js';
import { config } from '../src/shared/config/index.js';

describe('simulator scenarios', () => {
  it('high-power-usage turns all fans ON and pushes watts up', () => {
    const c = makeTestContainer();
    c.simulator.setScenario('high-power-usage');
    c.simulator.tick();

    const devices = c.repositories.devices.findAll();
    const fans = devices.filter((d) => d.type === 'FAN');
    expect(fans.every((f) => f.status === 'ON')).toBe(true);
    expect(c.office.buildSummary().officeWatts).toBeGreaterThan(config.HIGH_ROOM_WATT_THRESHOLD);
  });

  it('room-overactive drives the first room fully ON', () => {
    const c = makeTestContainer();
    c.simulator.setScenario('room-overactive');
    c.simulator.tick();

    const summary = c.office.buildSummary();
    const first = summary.rooms[0]!;
    expect(first.activeDeviceCount).toBe(first.deviceCount);
  });

  it('all-off turns every device OFF', () => {
    const c = makeTestContainer();
    // First switch things on.
    c.simulator.setScenario('high-power-usage');
    c.simulator.tick();
    expect(c.office.buildSummary().activeDevices).toBeGreaterThan(0);

    c.simulator.setScenario('all-off');
    c.simulator.tick();
    expect(c.office.buildSummary().activeDevices).toBe(0);
    expect(c.office.buildSummary().officeWatts).toBe(0);
  });

  it('emits office:summary.updated on each tick (socket event emission)', () => {
    const c = makeTestContainer();
    const spy = vi.spyOn(c.realtime, 'emit');
    c.simulator.tick();
    const events = spy.mock.calls.map((call) => call[0]);
    expect(events).toContain('office:summary.updated');
    expect(events).toContain('room:updated');
  });

  it('broadcasts post-evaluation alert text on toggle (no stale messages)', () => {
    // 22:00 -> after hours, so toggling a device ON creates an alert.
    const c = makeTestContainer(new Date(2026, 0, 1, 22, 0, 0));
    const room = c.office.buildSummary().rooms[0]!;
    const [d1, d2] = c.repositories.devices.findByRoomId(room.id);

    c.simulator.toggleDevice(d1!.id); // alert created: "1 device"

    const spy = vi.spyOn(c.realtime, 'emit');
    c.simulator.toggleDevice(d2!.id); // second device ON

    // The EMITTED summary (what the dashboard receives) must already carry
    // the refreshed "2 device" message, not the stale "1 device" one.
    const summaries = spy.mock.calls.filter((call) => call[0] === 'office:summary.updated');
    expect(summaries.length).toBeGreaterThan(0);
    const emitted = summaries[summaries.length - 1]![1] as {
      activeAlerts: { message: string }[];
    };
    const roomAlert = emitted.activeAlerts.find((a) => a.message.includes(room.name));
    expect(roomAlert).toBeDefined();
    expect(roomAlert!.message).toContain('2 device');
  });

  it('does not flip every device every tick under normal hours', () => {
    const c = makeTestContainer();
    c.simulator.setScenario('normal-working-hours');
    c.simulator.setRng(() => 0.5);
    c.simulator.tick();
    const changed = c.repositories.devices
      .findAll()
      .filter((d) => d.status === 'ON').length;
    // normal scenario changes at most a few devices per tick
    expect(changed).toBeLessThanOrEqual(3);
  });
});

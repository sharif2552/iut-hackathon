import { describe, expect, it } from 'vitest';
import { makeTestContainer } from './helpers.js';

describe('office summary (integration)', () => {
  it('seeds the physical layout and derives totals from the DB (not hardcoded)', () => {
    const c = makeTestContainer();
    const summary = c.office.buildSummary();
    // 3 rooms x (2 fans + 3 lights) = 15 devices
    expect(summary.totalRooms).toBe(3);
    expect(summary.totalDevices).toBe(15);
    expect(summary.rooms.every((r) => r.deviceCount === 5)).toBe(true);
  });

  it('starts fully off with 0W and no active devices', () => {
    const c = makeTestContainer();
    const summary = c.office.buildSummary();
    expect(summary.officeWatts).toBe(0);
    expect(summary.activeDevices).toBe(0);
  });

  it('reflects a toggled device in office and room watts', () => {
    const c = makeTestContainer();
    const fan = c.repositories.devices.findAll().find((d) => d.type === 'FAN')!;
    c.simulator.toggleDevice(fan.id);

    const summary = c.office.buildSummary();
    expect(summary.officeWatts).toBe(60);
    expect(summary.activeDevices).toBe(1);
    const room = summary.rooms.find((r) => r.id === fan.roomId)!;
    expect(room.watts).toBe(60);
    expect(room.fansOn).toBe(1);
  });

  it('resolves room summaries by slug', () => {
    const c = makeTestContainer();
    const room = c.office.getRoomBySlug('work-room-1');
    expect(room?.name).toBe('Work Room 1');
    expect(c.office.getRoomBySlug('nope')).toBeUndefined();
  });
});

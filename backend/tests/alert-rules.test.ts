import { describe, expect, it } from 'vitest';
import { AfterHoursRule, isAfterHours } from '../src/alert-engine/after-hours.rule.js';
import { RoomOveractiveRule } from '../src/alert-engine/room-overactive.rule.js';
import { HighPowerRule } from '../src/alert-engine/high-power.rule.js';
import type { RoomSummaryDto, DeviceDto } from '../src/modules/office/office.types.js';
import type { RuleContext } from '../src/alert-engine/types.js';

function device(over: Partial<DeviceDto> = {}): DeviceDto {
  return {
    id: 'd1',
    roomId: 'work-room-1',
    roomName: 'Work Room 1',
    name: 'Fan 1',
    type: 'FAN',
    status: 'ON',
    nominalWattage: 60,
    currentWatts: 60,
    lastChangedAt: new Date().toISOString(),
    ...over,
  };
}

function room(over: Partial<RoomSummaryDto> = {}): RoomSummaryDto {
  return {
    id: 'work-room-1',
    slug: 'work-room-1',
    name: 'Work Room 1',
    watts: 120,
    deviceCount: 5,
    activeDeviceCount: 3,
    fansOn: 1,
    fansTotal: 2,
    lightsOn: 2,
    lightsTotal: 3,
    devices: [device()],
    activeAlertCount: 0,
    ...over,
  };
}

function ctx(now: Date, rooms: RoomSummaryDto[]): RuleContext {
  return { now, rooms, officeStartHour: 9, officeEndHour: 17, highRoomWattThreshold: 250 };
}

describe('after-hours rule', () => {
  it('classifies hours correctly', () => {
    expect(isAfterHours(22, 9, 17)).toBe(true);
    expect(isAfterHours(8, 9, 17)).toBe(true);
    expect(isAfterHours(12, 9, 17)).toBe(false);
    expect(isAfterHours(17, 9, 17)).toBe(true); // end is exclusive
  });

  it('alerts for rooms with active devices after hours', () => {
    const at10pm = new Date(2026, 0, 1, 22, 0, 0);
    const signals = new AfterHoursRule().evaluate(ctx(at10pm, [room({ activeDeviceCount: 3 })]));
    expect(signals).toHaveLength(1);
    expect(signals[0]!.deduplicationKey).toBe('AFTER_HOURS_WASTE:work-room-1');
  });

  it('does not alert during office hours', () => {
    const noon = new Date(2026, 0, 1, 12, 0, 0);
    expect(new AfterHoursRule().evaluate(ctx(noon, [room()]))).toHaveLength(0);
  });

  it('does not alert when the room is empty of active devices', () => {
    const at10pm = new Date(2026, 0, 1, 22, 0, 0);
    const signals = new AfterHoursRule().evaluate(
      ctx(at10pm, [room({ activeDeviceCount: 0 })]),
    );
    expect(signals).toHaveLength(0);
  });
});

describe('room-overactive rule', () => {
  it('alerts when all devices ON for more than 2 hours', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    const fullyOn = room({
      deviceCount: 2,
      activeDeviceCount: 2,
      devices: [
        device({ id: 'a', lastChangedAt: threeHoursAgo }),
        device({ id: 'b', lastChangedAt: threeHoursAgo }),
      ],
    });
    const signals = new RoomOveractiveRule().evaluate(ctx(now, [fullyOn]));
    expect(signals).toHaveLength(1);
    expect(signals[0]!.severity).toBe('CRITICAL');
  });

  it('does not alert if a device turned on within 2 hours', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    const recent = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const fullyOn = room({
      deviceCount: 2,
      activeDeviceCount: 2,
      devices: [device({ id: 'a', lastChangedAt: recent }), device({ id: 'b', lastChangedAt: recent })],
    });
    expect(new RoomOveractiveRule().evaluate(ctx(now, [fullyOn]))).toHaveLength(0);
  });

  it('does not alert if the room is not fully ON', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    const partial = room({ deviceCount: 5, activeDeviceCount: 4 });
    expect(new RoomOveractiveRule().evaluate(ctx(now, [partial]))).toHaveLength(0);
  });
});

describe('high-power rule', () => {
  it('alerts when room watts exceed threshold', () => {
    const now = new Date();
    const signals = new HighPowerRule().evaluate(ctx(now, [room({ watts: 300 })]));
    expect(signals).toHaveLength(1);
    expect(signals[0]!.type).toBe('HIGH_ROOM_USAGE');
  });

  it('does not alert below threshold', () => {
    const now = new Date();
    expect(new HighPowerRule().evaluate(ctx(now, [room({ watts: 100 })]))).toHaveLength(0);
  });
});

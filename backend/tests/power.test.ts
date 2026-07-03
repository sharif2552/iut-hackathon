import { describe, expect, it } from 'vitest';
import { deviceWatts, sumWatts } from '../src/modules/energy/power.service.js';

describe('power calculations', () => {
  it('an OFF device draws 0W regardless of nominal wattage', () => {
    expect(deviceWatts({ status: 'OFF', nominalWattage: 60 })).toBe(0);
    expect(deviceWatts({ status: 'OFF', nominalWattage: 15 })).toBe(0);
  });

  it('an ON device draws its nominal wattage', () => {
    expect(deviceWatts({ status: 'ON', nominalWattage: 60 })).toBe(60);
    expect(deviceWatts({ status: 'ON', nominalWattage: 15 })).toBe(15);
  });

  it('sums only active device wattage', () => {
    const devices = [
      { status: 'ON', nominalWattage: 60 },
      { status: 'OFF', nominalWattage: 60 },
      { status: 'ON', nominalWattage: 15 },
      { status: 'ON', nominalWattage: 15 },
      { status: 'OFF', nominalWattage: 15 },
    ] as const;
    // 60 + 15 + 15 = 90
    expect(sumWatts([...devices])).toBe(90);
  });

  it('an empty room draws 0W', () => {
    expect(sumWatts([])).toBe(0);
  });
});

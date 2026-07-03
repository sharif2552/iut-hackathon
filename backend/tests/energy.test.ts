import { describe, expect, it } from 'vitest';
import { incrementalEnergyWh, whToKwh } from '../src/modules/energy/power.service.js';

describe('energy accumulation', () => {
  it('accumulates Wh from constant watts over one hour', () => {
    // 100W constant for 1 hour = 100 Wh
    expect(incrementalEnergyWh(100, 100, 3_600_000)).toBeCloseTo(100, 6);
  });

  it('uses the trapezoidal average across a step change', () => {
    // from 0W to 200W over 1h -> average 100W -> 100 Wh
    expect(incrementalEnergyWh(0, 200, 3_600_000)).toBeCloseTo(100, 6);
  });

  it('scales linearly with time', () => {
    // 600W for 30 seconds = 600 * (30/3600) = 5 Wh
    expect(incrementalEnergyWh(600, 600, 30_000)).toBeCloseTo(5, 6);
  });

  it('returns 0 for non-positive elapsed time', () => {
    expect(incrementalEnergyWh(500, 500, 0)).toBe(0);
    expect(incrementalEnergyWh(500, 500, -1000)).toBe(0);
  });

  it('converts Wh to kWh', () => {
    expect(whToKwh(4200)).toBeCloseTo(4.2, 6);
  });
});

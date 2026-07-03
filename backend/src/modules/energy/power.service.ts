import type { DeviceRow } from '../../database/schema.js';

/** Watts drawn by a single device. OFF devices always draw 0W. */
export function deviceWatts(device: Pick<DeviceRow, 'status' | 'nominalWattage'>): number {
  return device.status === 'ON' ? device.nominalWattage : 0;
}

/** Sum of active device wattage. */
export function sumWatts(devices: Pick<DeviceRow, 'status' | 'nominalWattage'>[]): number {
  return devices.reduce((total, d) => total + deviceWatts(d), 0);
}

/**
 * Incremental energy in watt-hours consumed over an interval.
 * energyWh = averageWatts * (elapsedMs / 3_600_000).
 * We use the trapezoidal average of the previous and current wattage so a step
 * change between samples is not over- or under-counted.
 */
export function incrementalEnergyWh(
  previousWatts: number,
  currentWatts: number,
  elapsedMs: number,
): number {
  if (elapsedMs <= 0) return 0;
  const averageWatts = (previousWatts + currentWatts) / 2;
  return (averageWatts * elapsedMs) / 3_600_000;
}

/** Convert watt-hours to kilowatt-hours. */
export function whToKwh(wh: number): number {
  return wh / 1000;
}

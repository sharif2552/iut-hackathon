/**
 * Clock abstraction so tests can control time deterministically.
 * All domain code should read "now" from a Clock, never `new Date()` directly.
 */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

/** Fixed clock for tests. */
export function fixedClock(date: Date): Clock {
  return { now: () => new Date(date) };
}

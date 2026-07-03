import { createDatabase } from '../src/database/client.js';
import { fixedClock } from '../src/shared/clock/index.js';
import { createContainer, type Container } from '../src/container.js';

/** Build a fully-wired container backed by an in-memory SQLite database. */
export function makeTestContainer(now = new Date(2026, 0, 1, 12, 0, 0)): Container {
  const database = createDatabase(':memory:');
  return createContainer({ database, clock: fixedClock(now), seed: true });
}

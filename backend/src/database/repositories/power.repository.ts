import { desc, gte } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Db } from '../client.js';
import { powerSamples, type PowerSampleRow } from '../schema.js';

export class PowerRepository {
  constructor(private readonly db: Db) {}

  insert(input: Omit<PowerSampleRow, 'id'>): PowerSampleRow {
    const row: PowerSampleRow = { id: randomUUID(), ...input };
    this.db.insert(powerSamples).values(row).run();
    return row;
  }

  latest(): PowerSampleRow | undefined {
    return this.db
      .select()
      .from(powerSamples)
      .orderBy(desc(powerSamples.sampledAt))
      .limit(1)
      .get();
  }

  since(from: Date, limit = 500): PowerSampleRow[] {
    return this.db
      .select()
      .from(powerSamples)
      .where(gte(powerSamples.sampledAt, from))
      .orderBy(desc(powerSamples.sampledAt))
      .limit(limit)
      .all();
  }

  /** Sum of incremental energyWh for samples on/after `from`. */
  energyWhSince(from: Date): number {
    return this.since(from, 100000).reduce((sum, s) => sum + s.energyWh, 0);
  }
}

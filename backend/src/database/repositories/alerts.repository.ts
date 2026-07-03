import { and, desc, eq } from 'drizzle-orm';
import type { Db } from '../client.js';
import { alerts, type AlertRow } from '../schema.js';

export class AlertsRepository {
  constructor(private readonly db: Db) {}

  findActive(): AlertRow[] {
    return this.db
      .select()
      .from(alerts)
      .where(eq(alerts.status, 'ACTIVE'))
      .orderBy(desc(alerts.createdAt))
      .all();
  }

  findActiveByDedupe(key: string): AlertRow | undefined {
    return this.db
      .select()
      .from(alerts)
      .where(and(eq(alerts.deduplicationKey, key), eq(alerts.status, 'ACTIVE')))
      .get();
  }

  findRecent(limit = 50): AlertRow[] {
    return this.db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(limit).all();
  }

  insert(row: AlertRow): void {
    this.db.insert(alerts).values(row).run();
  }

  resolve(id: string, resolvedAt: Date): void {
    this.db
      .update(alerts)
      .set({ status: 'RESOLVED', resolvedAt })
      .where(eq(alerts.id, id))
      .run();
  }
}

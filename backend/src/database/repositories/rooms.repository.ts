import { eq } from 'drizzle-orm';
import type { Db } from '../client.js';
import { rooms, type RoomRow } from '../schema.js';

export class RoomsRepository {
  constructor(private readonly db: Db) {}

  findAll(): RoomRow[] {
    return this.db.select().from(rooms).all();
  }

  findBySlug(slug: string): RoomRow | undefined {
    return this.db.select().from(rooms).where(eq(rooms.slug, slug)).get();
  }

  findById(id: string): RoomRow | undefined {
    return this.db.select().from(rooms).where(eq(rooms.id, id)).get();
  }

  insert(row: RoomRow): void {
    this.db.insert(rooms).values(row).run();
  }

  count(): number {
    return this.db.select().from(rooms).all().length;
  }
}

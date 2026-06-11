import { type DrizzleDb } from "@/database";
import { buildings } from "@/database/schemas";
import type { Building } from "@/types/infrastructure";
import type {
  BuildingInput,
  BuildingQueryInput,
  BuildingUpdateInput,
} from "@/validators/infrastructure";
import { and, count, eq, ilike, SQL } from "drizzle-orm";

export class BuildingRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findOne(id: number): Promise<Building | undefined> {
    return this.db.query.buildings.findFirst({ where: eq(buildings.id, id) });
  }

  async findByName(name: string): Promise<Building | undefined> {
    return this.db.query.buildings.findFirst({
      where: eq(buildings.name, name),
    });
  }

  async findAll(
    query: BuildingQueryInput,
  ): Promise<{ data: Building[]; total: number; page: number; limit: number }> {
    const { name, isActive, page = 1, limit = 10 } = query;

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    if (name === "all" && isActive === undefined) {
      const [data, countResult] = await Promise.all([
        this.db.query.buildings.findMany({
          columns: { id: true, name: true, isActive: true },
          limit: safeLimit,
          offset: (safePage - 1) * safeLimit,
        }),
        this.db.select({ total: count() }).from(buildings),
      ]);

      return {
        data,
        total: countResult[0]?.total ?? 0,
        page: safePage,
        limit: safeLimit,
      };
    }

    const conditions: SQL[] = [];

    if (name?.trim())
      conditions.push(ilike(buildings.name, `%${name.trim()}%`));
    if (isActive !== undefined)
      conditions.push(eq(buildings.isActive, isActive));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.buildings.findMany({
        where,
        columns: { id: true, name: true, isActive: true },
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
      }),
      this.db.select({ total: count() }).from(buildings).where(where),
    ]);

    return {
      data,
      total: countResult[0]?.total ?? 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  async create(data: BuildingInput): Promise<Building> {
    const [newBuilding] = await this.db
      .insert(buildings)
      .values(data)
      .returning();
    return newBuilding!;
  }

  async update(
    id: number,
    data: BuildingUpdateInput,
  ): Promise<Building | undefined> {
    const [updated] = await this.db
      .update(buildings)
      .set(data)
      .where(eq(buildings.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<Building> {
    const [deleted] = await this.db
      .delete(buildings)
      .where(eq(buildings.id, id))
      .returning();
    return deleted!;
  }
}

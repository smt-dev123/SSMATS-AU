import { type DrizzleDb } from "@/database";
import { classrooms } from "@/database/schemas";
import type { Classroom, ClassroomWithBuilding } from "@/types/infrastructure";
import type {
  ClassroomInput,
  ClassroomQueryInput,
  ClassroomUpdateInput,
} from "@/validators/infrastructure";
import { and, count, eq, ilike, SQL } from "drizzle-orm";

export class ClassroomRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findOne(id: number): Promise<Classroom | undefined> {
    return this.db.query.classrooms.findFirst({ where: eq(classrooms.id, id) });
  }

  async findAll(query: ClassroomQueryInput): Promise<{
    data: ClassroomWithBuilding[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { name, floor, isAvailable, page = 1, limit = 10 } = query;

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    if (name === "all" && floor === undefined && isAvailable === undefined) {
      const [data, countResult] = await Promise.all([
        this.db.query.classrooms.findMany({
          columns: {
            id: true,
            name: true,
            classroomNumber: true,
            floor: true,
            isAvailable: true,
          },
          with: {
            building: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.db.select({ total: count() }).from(classrooms),
      ]);

      return { data, total: countResult[0]?.total ?? 0, page, limit };
    }

    const conditions: SQL[] = [];
    if (name?.trim())
      conditions.push(ilike(classrooms.name, `%${name.trim()}%`));
    if (floor !== undefined) conditions.push(eq(classrooms.floor, floor));
    if (isAvailable !== undefined)
      conditions.push(eq(classrooms.isAvailable, isAvailable));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.classrooms.findMany({
        where,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        columns: {
          id: true,
          name: true,
          classroomNumber: true,
          floor: true,
          isAvailable: true,
        },
        with: {
          building: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.db.select({ total: count() }).from(classrooms).where(where),
    ]);

    const total = countResult[0]?.total ?? 0;

    return { data, total, page: safePage, limit: safeLimit };
  }

  async findByBuildingAndName(
    buildingId: number,
    name: string,
  ): Promise<Classroom | undefined> {
    return this.db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.buildingId, buildingId),
        eq(classrooms.name, name),
      ),
    });
  }

  async create(data: ClassroomInput): Promise<Classroom> {
    const [newClassroom] = await this.db
      .insert(classrooms)
      .values(data)
      .returning();
    return newClassroom!;
  }

  async update(
    id: number,
    data: ClassroomUpdateInput,
  ): Promise<Classroom | undefined> {
    const [updated] = await this.db
      .update(classrooms)
      .set(data)
      .where(eq(classrooms.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<Classroom> {
    const [deleted] = await this.db
      .delete(classrooms)
      .where(eq(classrooms.id, id))
      .returning();
    return deleted!;
  }
}

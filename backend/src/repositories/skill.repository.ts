import type { DrizzleDb } from "@/database";
import { skills } from "@/database/schemas";
import type {
  CreateSkill,
  Skill,
  SkillQueryInput,
  UpdateSkill,
} from "@/types/academy";
import { and, count, eq, like, SQL } from "drizzle-orm";

export class SkillRepository {
  constructor(private db: DrizzleDb) {}

  async create(data: CreateSkill): Promise<Skill | undefined> {
    const [result] = await this.db.insert(skills).values(data).returning();
    return result;
  }

  async update(id: number, data: UpdateSkill): Promise<Skill | undefined> {
    const [result] = await this.db
      .update(skills)
      .set(data)
      .where(eq(skills.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<Skill | undefined> {
    const [result] = await this.db
      .delete(skills)
      .where(eq(skills.id, id))
      .returning();
    return result;
  }

  async findById(id: number): Promise<Skill | undefined> {
    return await this.db.query.skills.findFirst({ where: eq(skills.id, id) });
  }

  async findAll(
    query: SkillQueryInput,
  ): Promise<{ total: number; data: Skill[]; page: number; limit: number }> {
    const { page = 1, limit = 10, ...rest } = query;
    const conditions: SQL[] = [];

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    if (rest.name) {
      conditions.push(like(skills.name, `%${rest.name}%`));
    }
    if (rest.facultyId) {
      conditions.push(eq(skills.facultyId, rest.facultyId));
    }
    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [data, totalCount] = await Promise.all([
      this.db.query.skills.findMany({
        where: whereClause,
        with: {
          faculty: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
      }),
      this.db
        .select({ count: count(skills.id) })
        .from(skills)
        .where(whereClause),
    ]);

    const total = totalCount[0]?.count ?? 0;
    return { total, data, page: safePage, limit: safeLimit };
  }
}

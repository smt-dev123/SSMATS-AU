import { type DrizzleDb } from "@/database";
import { academicLevels, faculties, teachers, user } from "@/database/schemas";
import type {
  CreateTeacher,
  Teacher,
  TeacherQueryInput,
  UpdateTeacher,
} from "@/types/academy";
import { generateId } from "@/utils/generate-id";
import { and, count, eq, ilike, SQL, desc, getTableColumns } from "drizzle-orm";

export class TeacherRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll(query: TeacherQueryInput): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { name, facultyId, academicLevelId, page, limit } = query;
    const conditions: SQL[] = [];
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    if (name?.trim()) conditions.push(ilike(user.name, `%${name.trim()}%`));
    if (facultyId && facultyId !== "all")
      conditions.push(eq(teachers.facultyId, Number(facultyId)));
    if (academicLevelId)
      conditions.push(eq(teachers.academicLevelId, academicLevelId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(teachers),
          name: user.name,
          nameEn: user.nameEn,
          email: user.email,
          faculty: faculties,
          academicLevel: academicLevels,
        })
        .from(teachers)
        .innerJoin(user, eq(teachers.userId, user.id))
        .leftJoin(faculties, eq(teachers.facultyId, faculties.id))
        .leftJoin(
          academicLevels,
          eq(teachers.academicLevelId, academicLevels.id),
        )
        .where(where)
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit)
        .orderBy(desc(teachers.createdAt)),
      this.db
        .select({ total: count() })
        .from(teachers)
        .innerJoin(user, eq(teachers.userId, user.id))
        .where(where),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async findById(id: number): Promise<any | undefined> {
    const [result] = await this.db
      .select({
        ...getTableColumns(teachers),
        name: user.name,
        nameEn: user.nameEn,
        email: user.email,
        faculty: faculties,
        academicLevel: academicLevels,
      })
      .from(teachers)
      .innerJoin(user, eq(teachers.userId, user.id))
      .leftJoin(faculties, eq(teachers.facultyId, faculties.id))
      .leftJoin(academicLevels, eq(teachers.academicLevelId, academicLevels.id))
      .where(eq(teachers.id, id))
      .limit(1);
    return result;
  }

  async findByUserId(id: string): Promise<any | undefined> {
    const [result] = await this.db
      .select({
        ...getTableColumns(teachers),
        name: user.name,
        nameEn: user.nameEn,
        email: user.email,
        faculty: faculties,
        academicLevel: academicLevels,
      })
      .from(teachers)
      .innerJoin(user, eq(teachers.userId, user.id))
      .leftJoin(faculties, eq(teachers.facultyId, faculties.id))
      .leftJoin(academicLevels, eq(teachers.academicLevelId, academicLevels.id))
      .where(eq(teachers.userId, id))
      .limit(1);
    return result;
  }

  async create(data: any): Promise<any> {
    const teacherId = generateId();
    const [teacher] = await this.db
      .insert(teachers)
      .values({ ...data, id: teacherId })
      .returning();
    return teacher!;
  }

  async update(id: number, data: any): Promise<any | undefined> {
    const [teacher] = await this.db
      .update(teachers)
      .set(data)
      .where(eq(teachers.id, id))
      .returning();
    return teacher;
  }

  async delete(id: number): Promise<any> {
    const [deleted] = await this.db
      .delete(teachers)
      .where(eq(teachers.id, id))
      .returning();
    return deleted!;
  }
}

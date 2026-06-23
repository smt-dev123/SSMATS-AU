// repository
import { type DrizzleDb, type Transaction } from "@/database";
import { courses, students, schedules, user } from "@/database/schemas";
import type { Course } from "@/types/academy";
import type {
  CourseInput,
  CourseUpdateInput,
  CourseQueryInput,
} from "@/validators/academy";
import { and, eq, sql, inArray, ilike, or, getTableColumns } from "drizzle-orm";

const SESSION_DURATION = 1.5; // hours per session

export class CourseRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findOne(id: number, tx?: Transaction): Promise<Course | undefined> {
    const client = tx ?? this.db;
    return client.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        schedule: {
          with: {
            faculty: true,
            academicLevel: true,
            sessionTime: true,
            classroom: true,
            department: true,
          },
        },
        teacher: true,
      },
    });
  }

  async findAll(query: CourseQueryInput): Promise<{
    data: Course[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      name,
      academicYearId,
      teacherId,
      studentId,
      facultyId,
      departmentId,
      academicLevelId,
      generation,
      semester,
      page = 1,
      limit = 10,
    } = query;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (name) {
      conditions.push(
        or(ilike(courses.name, `%${name}%`), ilike(courses.code, `%${name}%`)),
      );
    }

    if (academicYearId) {
      conditions.push(eq(courses.academicYearId, academicYearId));
    }

    if (teacherId) {
      conditions.push(eq(courses.teacherId, teacherId));
    }

    if (facultyId) {
      conditions.push(eq(schedules.facultyId, facultyId));
    }
    if (departmentId) {
      conditions.push(eq(schedules.departmentId, departmentId));
    }
    if (academicLevelId) {
      conditions.push(eq(schedules.academicLevelId, academicLevelId));
    }
    if (generation) {
      conditions.push(eq(schedules.generation, generation));
    }
    if (semester) {
      conditions.push(eq(schedules.semester, semester));
    }

    // If studentId is provided, we filter courses by student's academic profile
    if (studentId) {
      const student = await this.db.query.students.findFirst({
        where: eq(students.id, studentId),
      });

      if (student) {
        if (student.facultyId)
          conditions.push(eq(schedules.facultyId, student.facultyId));
        if (student.departmentId)
          conditions.push(eq(schedules.departmentId, student.departmentId));
        if (student.academicLevelId)
          conditions.push(
            eq(schedules.academicLevelId, student.academicLevelId),
          );
        if (student.generation)
          conditions.push(eq(schedules.generation, student.generation));
        if (student.semester)
          conditions.push(eq(schedules.semester, student.semester));
        if (student.academicYearId)
          conditions.push(eq(schedules.academicYearId, student.academicYearId));
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Use core drizzle for join filtering
    const baseQuery = this.db
      .select({ id: courses.id })
      .from(courses)
      .leftJoin(schedules, eq(courses.scheduleId, schedules.id))
      .where(where);

    const totalResult = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(baseQuery.as("subquery"));

    const total = totalResult[0]?.total ?? 0;

    // Get the IDs first for pagination, then use findMany with relations
    const paginatedIds = await this.db
      .select({ id: courses.id })
      .from(courses)
      .leftJoin(schedules, eq(courses.scheduleId, schedules.id))
      .where(where)
      .limit(limit)
      .offset(offset);

    const ids = paginatedIds.map((item) => item.id);

    let data: Course[] = [];
    if (ids.length > 0) {
      data = await this.db.query.courses.findMany({
        where: inArray(courses.id, ids),
        with: {
          schedule: {
            with: {
              faculty: true,
              academicLevel: true,
              sessionTime: true,
              classroom: true,
              department: true,
            },
          },
          teacher: {
            with: {
              user: { columns: { name: true, nameEn: true } },
            },
          },
        },
      });

      // Sort data to match IDs order if necessary, but findMany usually returns in order or we can sort
      data.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }

    return {
      data,
      total: Number(total),
      page,
      limit,
    };
  }

  async create(data: CourseInput): Promise<Course | undefined> {
    const session = Number(data.hours) / SESSION_DURATION;
    const [course] = await this.db
      .insert(courses)
      .values({
        ...data,
        session,
        totalHoursLeft: data.hours,
        totalSessionLeft: session,
      })
      .returning();
    return course;
  }

  async createMany(data: CourseInput[], tx?: Transaction): Promise<Course[]> {
    const client = tx ?? this.db;
    return client
      .insert(courses)
      .values(
        data.map((d) => ({
          ...d,
          session: Number(d.hours) / SESSION_DURATION,
          totalHoursLeft: d.hours,
          totalSessionLeft: Number(d.hours) / SESSION_DURATION,
        })),
      )
      .returning();
  }

  async update(
    id: number,
    data: CourseUpdateInput,
  ): Promise<Course | undefined> {
    const [course] = await this.db
      .update(courses)
      .set({ ...data, updatedAt: new Date() }) // ← updatedAt kept fresh
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async delete(id: number): Promise<Course | undefined> {
    const [course] = await this.db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteByScheduleId(
    scheduleId: number,
    tx?: Transaction,
  ): Promise<void> {
    const client = tx ?? this.db;
    await client.delete(courses).where(eq(courses.scheduleId, scheduleId));
  }

  async updateCourseHoursAndSession(
    id: number,
    hours: string,
    tx?: Transaction,
  ): Promise<Course | undefined> {
    const client = tx ?? this.db;
    const [course] = await client
      .update(courses)
      .set({
        totalHoursLeft: sql`${courses.totalHoursLeft} - ${hours}::numeric`,
        totalSessionLeft: sql`${courses.totalSessionLeft} - 1`,
        updatedAt: new Date(), // ← updatedAt kept fresh
      })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async getCourseStudents(courseId: number): Promise<any[]> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: { schedule: true },
    });

    if (!course || !course.schedule) return [];

    const { schedule } = course;
    return this.db
      .select({
        ...getTableColumns(students),
        name: user.name,
        nameEn: user.nameEn,
        email: user.email,
      })
      .from(students)
      .innerJoin(user, eq(students.userId, user.id))
      .where(
        and(
          eq(students.facultyId, schedule.facultyId),
          eq(students.departmentId, schedule.departmentId),
          eq(students.academicLevelId, schedule.academicLevelId),
          eq(students.generation, schedule.generation),
          eq(students.semester, schedule.semester),
          eq(students.academicYearId, schedule.academicYearId),
        ),
      );
  }
}

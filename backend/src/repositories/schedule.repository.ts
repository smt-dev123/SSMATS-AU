import { type DrizzleDb, type Transaction } from "@/database";
import { schedules, departments, faculties } from "@/database/schemas";
import type { Schedule } from "@/types/academy";
import type {
  ScheduleInput,
  ScheduleUniqueKeyInput,
  ScheduleUpdateInput,
} from "@/validators/academy";
import { and, eq, ilike, or, inArray } from "drizzle-orm";

export class ScheduleRepository {
  constructor(private readonly db: DrizzleDb) {}

  async create(
    data: ScheduleInput,
    tx: Transaction,
  ): Promise<Schedule | undefined> {
    const [schedule] = await tx.insert(schedules).values(data).returning();
    return schedule;
  }

  async findAll(query?: {
    name?: string
    academicYearId?: number
    facultyId?: number
    departmentId?: number
    academicLevelId?: number
  }): Promise<Schedule[]> {
    const conditions: any[] = []

    if (query?.name) {
      conditions.push(
        or(
          ilike(departments.name, `%${query.name}%`),
          ilike(faculties.name, `%${query.name}%`),
        ),
      )
    }

    if (query?.academicYearId) {
      conditions.push(eq(schedules.academicYearId, query.academicYearId))
    }
    if (query?.facultyId) {
      conditions.push(eq(schedules.facultyId, query.facultyId))
    }
    if (query?.departmentId) {
      conditions.push(eq(schedules.departmentId, query.departmentId))
    }
    if (query?.academicLevelId) {
      conditions.push(eq(schedules.academicLevelId, query.academicLevelId))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const schedulesWithFilters = await this.db
      .select({ id: schedules.id })
      .from(schedules)
      .leftJoin(departments, eq(schedules.departmentId, departments.id))
      .leftJoin(faculties, eq(schedules.facultyId, faculties.id))
      .where(where)

    const ids = schedulesWithFilters.map((s) => s.id)

    if (ids.length === 0) return []

    const results = await this.db.query.schedules.findMany({
      where: inArray(schedules.id, ids),
      with: {
        faculty: { columns: { id: true, name: true } },
        department: { columns: { id: true, name: true } },
        academicLevel: { columns: { id: true, level: true } },
        academicYear: { columns: { id: true, name: true } },
        classroom: {
          columns: { id: true, name: true },
          with: {
            building: { columns: { id: true, name: true } },
          },
        },
        sessionTime: {
          columns: {
            id: true,
            firstSessionStartTime: true,
            firstSessionEndTime: true,
            secondSessionStartTime: true,
            secondSessionEndTime: true,
          },
        },
        courses: {
          with: {
            teacher: {
              columns: { id: true, phone: true },
              with: {
                user: { columns: { name: true } }
              }
            },
          },
        },
      },
    })

    // Map the results to flatten user data into teacher if needed by the frontend
    return results.map((s: any) => ({
      ...s,
      courses: s.courses.map((c: any) => ({
        ...c,
        teacher: c.teacher ? {
          ...c.teacher,
          name: c.teacher.user?.name,
          phone: c.teacher.phone,
        } : null
      }))
    })) as any;
  }

  async findById(id: number): Promise<Schedule | null> {
    const schedule = await this.db.query.schedules.findFirst({
      where: eq(schedules.id, id),
      with: {
        faculty: { columns: { id: true, name: true } },
        department: { columns: { id: true, name: true } },
        academicLevel: { columns: { id: true, level: true } },
        academicYear: { columns: { id: true, name: true } },
        classroom: {
          columns: { id: true, name: true },
          with: {
            building: { columns: { id: true, name: true } },
          },
        },
        sessionTime: {
          columns: {
            id: true,
            firstSessionStartTime: true,
            firstSessionEndTime: true,
            secondSessionStartTime: true,
            secondSessionEndTime: true,
          },
        },
        courses: {
          with: {
            teacher: {
              columns: { id: true, phone: true },
              with: {
                user: { columns: { name: true } }
              }
            },
          },
        },
      },
    });

    if (!schedule) return null;

    return {
      ...schedule,
      courses: schedule.courses.map((c: any) => ({
        ...c,
        teacher: c.teacher ? {
          ...c.teacher,
          name: c.teacher.user?.name,
          phone: c.teacher.phone,
        } : null
      }))
    } as any;
  }

  async findByUniqueKey(
    data: ScheduleUniqueKeyInput,
    tx: Transaction,
  ): Promise<Schedule | null> {
    const schedule = await tx.query.schedules.findFirst({
      where: and(
        eq(schedules.facultyId, data.facultyId),
        eq(schedules.academicLevelId, data.academicLevelId),
        eq(schedules.generation, data.generation),
        eq(schedules.departmentId, data.departmentId),
        eq(schedules.semester, data.semester),
        eq(schedules.studyShift, data.studyShift),
        eq(schedules.year, data.year),
      ),
      with: {
        faculty: { columns: { id: true, name: true } },
        department: { columns: { id: true, name: true } },
        academicLevel: { columns: { id: true, level: true } },
        academicYear: { columns: { id: true, name: true } },
        classroom: { columns: { id: true, name: true } },
        sessionTime: {
          columns: {
            id: true,
            firstSessionStartTime: true,
            firstSessionEndTime: true,
            secondSessionStartTime: true,
            secondSessionEndTime: true,
          },
        },
        courses: {
          with: {
            teacher: {
              columns: { id: true, phone: true },
              with: {
                user: { columns: { name: true } }
              }
            },
          },
        },
      },
    });

    if (!schedule) return null;

    return {
      ...schedule,
      courses: schedule.courses.map((c: any) => ({
        ...c,
        teacher: c.teacher ? {
          ...c.teacher,
          name: c.teacher.user?.name,
          phone: c.teacher.phone,
        } : null
      }))
    } as any;
  }

  async update(
    id: number,
    data: ScheduleUpdateInput,
  ): Promise<Schedule | undefined> {
    const [schedule] = await this.db
      .update(schedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schedules.id, id))
      .returning();
    return schedule;
  }

  async delete(id: number): Promise<Schedule | undefined> {
    const [schedule] = await this.db
      .delete(schedules)
      .where(eq(schedules.id, id))
      .returning();
    return schedule;
  }
}

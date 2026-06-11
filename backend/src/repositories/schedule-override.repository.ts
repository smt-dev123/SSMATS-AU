import { type DrizzleDb, type Transaction } from "@/database";
import { scheduleOverrides } from "@/database/schemas";
import type {
  ScheduleOverrideInput,
  ScheduleOverrideUpdateInput,
} from "@/validators/academy";
import { eq, and, sql } from "drizzle-orm";

export class ScheduleOverrideRepository {
  constructor(private readonly db: DrizzleDb) {}

  async create(
    data: ScheduleOverrideInput,
    tx?: Transaction,
  ) {
    const client = tx ?? this.db;
    const [override] = await client
      .insert(scheduleOverrides)
      .values(data)
      .returning();
    return override;
  }

  async findAll(date?: string) {
    return this.db.query.scheduleOverrides.findMany({
      where: date ? eq(sql`DATE(${scheduleOverrides.date})`, date) : undefined,
      with: {
        originalCourse: {
          with: {
            schedule: {
              with: {
                classroom: true,
              }
            }
          }
        },
        replacementTeacher: true,
        replacementClassroom: true,
      },
    });
  }

  async findById(id: number) {
    const override = await this.db.query.scheduleOverrides.findFirst({
      where: eq(scheduleOverrides.id, id),
    });
    return override ?? null;
  }

  async findByCourseAndDate(courseId: number, date: string) {
    const override = await this.db.query.scheduleOverrides.findFirst({
      where: and(
        eq(scheduleOverrides.originalCourseId, courseId),
        eq(sql`DATE(${scheduleOverrides.date})`, date),
      ),
    });

    return override ?? null;
  }

  async update(id: number, data: ScheduleOverrideUpdateInput) {
    const [override] = await this.db
      .update(scheduleOverrides)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scheduleOverrides.id, id))
      .returning();
    return override;
  }

  async delete(id: number) {
    const [override] = await this.db
      .delete(scheduleOverrides)
      .where(eq(scheduleOverrides.id, id))
      .returning();
    return override;
  }
}

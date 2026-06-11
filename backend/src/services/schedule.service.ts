import type { DrizzleDb } from "@/database";
import { courses } from "@/database/schemas";
import { eq } from "drizzle-orm";
import type { CourseRepository } from "@/repositories/course.repository";
import type { ScheduleRepository } from "@/repositories/schedule.repository";
import type { StudentRepository } from "@/repositories/student.repository";
import type { Course, Schedule } from "@/types/academy";
import type {
  ScheduleUpdateInput,
  ScheduleUpdateWithCoursesInput,
  ScheduleWithCoursesInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

export class ScheduleService {
  constructor(
    private readonly db: DrizzleDb,
    private readonly scheduleRepo: ScheduleRepository,
    private readonly courseRepo: CourseRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async createSchedule(
    data: ScheduleWithCoursesInput,
  ): Promise<{ schedule: Schedule; courses: Course[] }> {
    const { schedule: scheduleData, courses: coursesData } = data;

    return this.db.transaction(async (tx) => {
      const existing = await this.scheduleRepo.findByUniqueKey(
        {
          facultyId: scheduleData.facultyId,
          academicLevelId: scheduleData.academicLevelId,
          departmentId: scheduleData.departmentId,
          semester: scheduleData.semester,
          studyShift: scheduleData.studyShift,
          generation: scheduleData.generation,
          year: scheduleData.year,
        },
        tx,
      );

      if (existing) {
        throw new HTTPException(409, { message: "Schedule already exists" });
      }

      const schedule = await this.scheduleRepo.create(scheduleData, tx);

      if (!schedule) {
        throw new HTTPException(500, {
          message: "Failed to create schedule",
        });
      }

      const courses = await this.courseRepo.createMany(
        coursesData.map((course) => ({
          ...course,
          scheduleId: schedule.id,
          academicYearId: schedule.academicYearId,
        })),
        tx,
      );

      await this.studentRepo.updateStudentAcademicYear(
        schedule.facultyId,
        schedule.departmentId,
        schedule.academicYearId,
        schedule.academicLevelId,
        tx,
      );

      return { schedule, courses };
    });
  }

  async findAll(query?: any): Promise<Schedule[]> {
    return this.scheduleRepo.findAll(query);
  }

  async findById(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findById(id);
    if (!schedule) {
      throw new HTTPException(404, { message: "Schedule not found" });
    }
    return schedule;
  }

  async updateSchedule(
    id: number,
    data: ScheduleUpdateWithCoursesInput,
  ): Promise<Schedule> {
    const { schedule: scheduleData, courses: coursesData } = data;

    return this.db.transaction(async (tx) => {
      // 1. Update Schedule Metadata
      const updated = await this.scheduleRepo.update(id, scheduleData);
      if (!updated) {
        throw new HTTPException(404, { message: "Schedule not found" });
      }

      // 2. Update Courses if provided
      if (coursesData) {
        // Get existing courses for this schedule
        const existingCourses = await tx.query.courses.findMany({
          where: eq(courses.scheduleId, id)
        });
        
        const existingIds = existingCourses.map(c => c.id);
        const inputIds = coursesData.map(c => c.id).filter(cid => cid !== undefined) as number[];
        
        const idsToDelete = existingIds.filter(cid => !inputIds.includes(cid));
        
        // Delete removed courses
        for (const cid of idsToDelete) {
          try {
            await tx.delete(courses).where(eq(courses.id, cid));
          } catch (e) {
            throw new HTTPException(400, { message: "Cannot delete a course that already has attendance records." });
          }
        }
        
        // Update existing and insert new courses
        for (const course of coursesData) {
          if (course.id) {
            await tx.update(courses).set({
              name: course.name,
              code: course.code,
              credits: course.credits,
              day: course.day,
              teacherId: course.teacherId,
              hours: String(course.hours),
              isActive: course.isActive ?? true,
              academicYearId: updated.academicYearId,
              updatedAt: new Date(),
            }).where(eq(courses.id, course.id));
          } else {
            const session = Number(course.hours) / 1.5;
            await tx.insert(courses).values({
              name: course.name,
              code: course.code,
              credits: course.credits,
              day: course.day,
              teacherId: course.teacherId,
              hours: String(course.hours),
              isActive: course.isActive ?? true,
              scheduleId: id,
              academicYearId: updated.academicYearId,
              session: session,
              totalHoursLeft: String(course.hours),
              totalSessionLeft: session,
            });
          }
        }
      }

      return updated;
    });
  }

  async deleteSchedule(id: number): Promise<void> {
    const deleted = await this.scheduleRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Schedule not found" });
    }
  }
}

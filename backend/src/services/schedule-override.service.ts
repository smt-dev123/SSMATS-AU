import { ScheduleOverrideRepository } from "@/repositories/schedule-override.repository";
import type {
  ScheduleOverrideInput,
  ScheduleOverrideUpdateInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { type DrizzleDb } from "@/database";
import { eq, and, lte, gte } from "drizzle-orm";
import { courses, schedules } from "@/database/schemas";
import type { NotificationService } from "@/services/notification.service";

export class ScheduleOverrideService {
  constructor(
    private readonly repository: ScheduleOverrideRepository,
    private readonly db: DrizzleDb,
    private readonly notificationService?: NotificationService
  ) {}

  async createOverride(data: ScheduleOverrideInput) {
    // Check if an override already exists for this course and date
    const existing = await this.repository.findByCourseAndDate(data.originalCourseId, data.date);
    if (existing) {
      throw new HTTPException(400, {
        message: "ការផ្លាស់ប្ដូរសម្រាប់មុខវិជ្ជា និងថ្ងៃនេះ មានរួចហើយ។ សូមកែប្រែជំនួសវិញ។", // "Override for this course and date already exists. Please update instead."
      });
    }
    const created = await this.repository.create(data);

    if (this.notificationService) {
      const course = await this.db.query.courses.findFirst({
        where: eq(courses.id, data.originalCourseId),
        with: { schedule: true }
      });

      if (course && course.schedule) {
        const actualDate = data.date || new Date().toISOString();
        const dateStr = actualDate.includes("T") ? actualDate.split("T")[0] : actualDate as any;
        const [yyyy, mm, dd] = dateStr.split("-");
        const formattedDate = `${dd}/${mm}/${yyyy}`;

        const nextWeekDate = new Date(dateStr);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        const nextDd = nextWeekDate.getDate().toString().padStart(2, "0");
        const nextMm = (nextWeekDate.getMonth() + 1).toString().padStart(2, "0");
        const nextYyyy = nextWeekDate.getFullYear();
        const nextWeekFormatted = `${nextDd}/${nextMm}/${nextYyyy}`;

        let msgContent = `- មុខវិជ្ជា ${course.name} មានការផ្លាស់ប្ដូរកាលវិភាគនៅថ្ងៃទី ${formattedDate}។\n`;
        if (data.isCancelled) {
          msgContent += "- ការបង្រៀនត្រូវបានលុបចោលសម្រាប់ថ្ងៃនេះ (និស្សិតអាចសម្រាកបាន)។\n";
        } else {
          msgContent += `- ទីតាំងឬគ្រូបង្រៀនអាចមានការផ្លាស់ប្ដូរ។\n`;
        }
        if (data.note) {
          msgContent += `- កំណត់ចំណាំ: ${data.note}។\n`;
        }
        // msgContent += `- ការផ្លាស់ប្ដូរនេះគិតចាប់ពីថ្ងៃនេះ រហូតដល់ថ្ងៃដែលត្រូវប៉ះមុខវិជ្ជានេះម្ដងទៀតនៅសប្ដាហ៍ក្រោយ (${nextWeekFormatted})។`;

        await this.notificationService.createBroadcast({
          title: "ការផ្លាស់ប្ដូរកាលវិភាគ / Schedule Changed",
          message: msgContent,
          facultyId: course.schedule.facultyId,
          targetDepartment: course.schedule.departmentId,
          targetGeneration: course.schedule.generation,
          priority: "high"
        }).catch(e => console.error("[ScheduleOverrideService] Failed to notify:", e));
      }
    }

    return created;
  }

  async getOverrides(date?: string) {
    return this.repository.findAll(date);
  }

  async getDailySchedule(dateStr: string, facultyId?: number) {
    const d = new Date(dateStr);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[d.getUTCDay()];

    const overrides = await this.repository.findAll(dateStr);
    const overridesMap = new Map();
    for (const o of overrides) {
      overridesMap.set(o.originalCourseId, o);
    }

    const allCourses = await this.db.query.courses.findMany({
      where: eq(courses.day, dayName as any),
      with: {
        schedule: {
          with: {
            classroom: true,
            sessionTime: true,
          }
        },
        teacher: true,
      }
    });

    const activeCoursesForDate = allCourses.filter(course => {
      const schedule = course.schedule;
      if (!schedule) return false;
      const dTime = new Date(dateStr).getTime();
      const start = new Date(schedule.semesterStart).getTime();
      const end = new Date(schedule.semesterEnd).getTime();
      // Ensure the course belongs to the selected faculty if provided
      if (facultyId && schedule.facultyId !== facultyId) return false;
      return dTime >= start && dTime <= end;
    });

    // Apply overrides
    const result = activeCoursesForDate.map(course => {
      const override = overridesMap.get(course.id);
      if (override) {
        if (override.isCancelled) {
          return { ...course, isCancelled: true, note: override.note };
        }
        return {
          ...course,
          isOverride: true,
          teacher: override.replacementTeacher || course.teacher,
          schedule: {
            ...course.schedule,
            classroom: override.replacementClassroom || course.schedule.classroom,
          },
          note: override.note,
        };
      }
      return course;
    });

    return result;
  }

  async updateOverride(id: number, data: ScheduleOverrideUpdateInput) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new HTTPException(404, { message: "Override not found" });
    }
    return this.repository.update(id, data);
  }

  async deleteOverride(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new HTTPException(404, { message: "Override not found" });
    }
    return this.repository.delete(id);
  }
}

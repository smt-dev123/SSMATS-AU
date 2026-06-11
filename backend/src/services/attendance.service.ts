import type {
  AttendanceData,
  AttendanceInput,
  AttendanceRecord,
  AttendanceReportQuery,
} from "@/types/attendance";
import type {
  BulkAttendanceInput,
  MarkAttendanceInput,
} from "@/validators/attendance";
import type { AttendanceRepository } from "@/repositories/attendance.repository";
import type { CourseRepository } from "@/repositories/course.repository";
import type { DrizzleDb } from "@/database";
import { HTTPException } from "hono/http-exception";
import { teachers, attendanceRecords } from "@/database/schemas";
import { and, eq, sql } from "drizzle-orm";

export class AttendanceService {
  constructor(
    private readonly db: DrizzleDb,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async markBulkAttendance(
    input: BulkAttendanceInput,
    user: { id: string; role: string },
  ): Promise<AttendanceRecord[]> {
    return this.db.transaction(async (tx) => {
      const course = await this.courseRepository.findOne(input.courseId, tx) as any;

      if (!course) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      let recordedBy: number | undefined;

      if (user.role === "teacher") {
        const teacher = await tx.query.teachers.findFirst({
          where: eq(teachers.userId, user.id),
          columns: { id: true },
        });

        if (!teacher) {
          throw new HTTPException(404, {
            message: "Teacher profile not found",
          });
        }
        recordedBy = teacher.id;

        // Teachers can only mark attendance for the current date
        const today = new Date().toISOString().split("T")[0];
        if (input.date !== today) {
          throw new HTTPException(403, {
            message: "Teachers are only allowed to mark attendance for today.",
          });
        }

        // 15-minute rule: Teachers must mark attendance within 15 minutes of start time
        // The time restriction has been removed to allow teachers to manage attendance anytime during the day.
      } else if (user.role !== "admin" && user.role !== "manager") {
        const teacher = await tx.query.teachers.findFirst({
          where: eq(teachers.userId, user.id),
          columns: { id: true },
        });
        if (teacher) recordedBy = teacher.id;
      }

      const records: AttendanceInput[] = input.mark.map((mark) => ({
        courseId: input.courseId,
        studentId: mark.studentId,
        date: input.date,
        status: mark.status,
        session: input.session,
        academicYearId: input.academicYearId,
        notes: mark.notes,
        recordedBy,
      }));

      if (course.totalSessionLeft <= 0) {
        // Only prevent new marks if sessions are exhausted.
      }

      // 1. Fetch existing records to determine what needs to be incremented vs adjusted
      const existingRecords = await tx.query.attendanceRecords.findMany({
        where: and(
          eq(attendanceRecords.courseId, input.courseId),
          eq(attendanceRecords.date, input.date),
          eq(attendanceRecords.session, input.session),
        ),
      });

      const existingMap = new Map(
        existingRecords.map((r) => [r.studentId, r.status]),
      );

      // 2. Process each record
      await Promise.all(
        records.map(async (record) => {
          const oldStatus = existingMap.get(record.studentId);

          if (oldStatus) {
            // Update existing record
            if (oldStatus !== record.status) {
              await this.attendanceRepository.adjustAttendanceSummary(
                record.studentId,
                record.courseId,
                input.academicYearId,
                oldStatus,
                record.status,
                tx,
              );
            }
          } else {
            // New record
            await this.attendanceRepository.incrementAttendanceSummary(
              record.studentId,
              record.courseId,
              input.academicYearId,
              input.facultyId,
              input.departmentId,
              record.status,
              course.session,
              course.totalSessionLeft,
              tx,
            );
          }

          await this.attendanceRepository.recalculateSummaryPercentages(
            record.studentId,
            record.courseId,
            input.academicYearId,
            tx,
          );
        }),
      );

      // 3. Upsert all records
      const attendance = await this.attendanceRepository.upsertAttendance(
        records,
        tx,
      );

      // 4. Update course hours only for NEW records
      const isNewMarking = existingRecords.length === 0;
      if (isNewMarking) {
        await this.courseRepository.updateCourseHoursAndSession(
          input.courseId,
          "1.5",
          tx,
        );
      }

      return attendance;
    });
  }

  async updateAttendanceStatus(
    studentId: number,
    courseId: number,
    date: Date,
    session: number,
    oldStatus: "present" | "absent" | "late" | "excused",
    newStatus: "present" | "absent" | "late" | "excused",
    academicYearId: number,
  ) {
    return this.db.transaction(async (tx) => {
      const course = await this.courseRepository.findOne(courseId, tx);

      if (!course) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      const [updated] = await Promise.all([
        this.attendanceRepository.updateAttendanceStatus(
          studentId,
          courseId,
          date,
          session,
          newStatus,
          tx,
        ),
        this.attendanceRepository.adjustAttendanceSummary(
          studentId,
          courseId,
          academicYearId,
          oldStatus,
          newStatus,
          tx,
        ),
      ]);

      await this.attendanceRepository.recalculateSummaryPercentages(
        studentId,
        courseId,
        academicYearId,
        tx,
      );

      return updated;
    });
  }

  async getAttendanceByStudentId(
    studentId: number,
  ): Promise<AttendanceRecord[]> {
    return this.attendanceRepository.getAttendanceByStudentId(studentId);
  }

  async getAttendanceByCourseIdAndDate(
    courseId: number,
    date: string,
    session?: number,
  ): Promise<AttendanceRecord[]> {
    return this.attendanceRepository.getAttendanceByCourseIdAndDate(
      courseId,
      date,
      session,
    );
  }

  async attendanceReport(query: AttendanceReportQuery) {
    return this.attendanceRepository.getAttendanceSummaryByCourseAndCohort(
      query,
    );
  }
}

import { type DrizzleDb, type Transaction } from "@/database";
import {
  attendanceRecords,
  attendanceSummaries,
  courses,
  students,
  user,
} from "@/database/schemas";
import type {
  AttendanceInput,
  AttendanceRecord,
  AttendanceReportQuery,
} from "@/types/attendance";
import { and, asc, eq, SQL, sql, inArray } from "drizzle-orm";

export class AttendanceRepository {
  constructor(private readonly db: DrizzleDb) {}

  async markAttendance(
    data: AttendanceInput[],
    tx?: Transaction,
  ): Promise<AttendanceRecord[]> {
    const client = tx ?? this.db;
    return client.insert(attendanceRecords).values(data).returning();
  }

  async upsertAttendance(
    data: AttendanceInput[],
    tx?: Transaction,
  ): Promise<AttendanceRecord[]> {
    const client = tx ?? this.db;
    return client
      .insert(attendanceRecords)
      .values(data)
      .onConflictDoUpdate({
        target: [
          attendanceRecords.courseId,
          attendanceRecords.studentId,
          attendanceRecords.date,
          attendanceRecords.session,
        ],
        set: {
          status: sql`EXCLUDED.status`,
          notes: sql`EXCLUDED.notes`,
          updatedAt: new Date(),
        },
      })
      .returning();
  }

  async getAttendanceByStudentId(studentId: number) {
    return this.db.query.attendanceRecords.findMany({
      where: eq(attendanceRecords.studentId, studentId),
      with: {
        course: { columns: { name: true } },
      },
    });
  }

  async getAttendanceByCourseIdAndDate(courseId: number, date: string, session?: number) {
    const conditions = [
      eq(attendanceRecords.courseId, courseId),
      eq(attendanceRecords.date, date),
    ];
    if (session) conditions.push(eq(attendanceRecords.session, session));

    return this.db.query.attendanceRecords.findMany({
      where: and(...conditions),
    });
  }

  async findAttendanceByStudentIdCourseIdAndDate(
    studentId: number,
    courseId: number,
    date: Date,
    session: number,
  ) {
    return this.db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.studentId, studentId),
        eq(attendanceRecords.courseId, courseId),
        eq(attendanceRecords.date, date.toISOString()),
        eq(attendanceRecords.session, session),
      ),
    });
  }

  async updateAttendanceStatus(
    studentId: number,
    courseId: number,
    date: Date,
    session: number,
    newStatus: "present" | "absent" | "late" | "excused",
    tx?: Transaction,
  ) {
    const client = tx ?? this.db;
    const [updated] = await client
      .update(attendanceRecords)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(
        and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.courseId, courseId),
          eq(attendanceRecords.date, date.toISOString()),
          eq(attendanceRecords.session, session),
        ),
      )
      .returning();
    return updated;
  }

  async getAttendanceByCourseAndCohort(
    courseId: number,
    date: Date,
    facultyId: number,
    departmentId: number,
    academicYearId: number,
    generation: number,
  ) {
    const res = await this.db
      .select({
        id: students.id,
        name: user.name,
      })
      .from(students)
      .innerJoin(user, eq(students.userId, user.id))
      .where(
        and(
          eq(students.facultyId, facultyId),
          eq(students.departmentId, departmentId),
          eq(students.academicYearId, academicYearId),
          eq(students.generation, generation),
        ),
      );

    const studentIds = res.map((s) => s.id);
    if (studentIds.length === 0) return [];

    const records = await this.db.query.attendanceRecords.findMany({
      where: and(
        inArray(attendanceRecords.studentId, studentIds),
        eq(attendanceRecords.courseId, courseId),
        eq(attendanceRecords.date, date.toISOString()),
        eq(attendanceRecords.academicYearId, academicYearId),
      ),
      columns: { studentId: true, date: true, session: true, status: true },
    });

    return res.map((s) => ({
      ...s,
      attendanceRecords: records.filter((r) => r.studentId === s.id),
    }));
  }

  async getAttendanceSummaryByCourseAndCohort(query: AttendanceReportQuery) {
    const {
      courseId,
      academicYearId,
      facultyId,
      departmentId,
      generation,
      limit = 10,
      page = 1,
    } = query;

    const safeLimit = Math.min(limit, 100);
    const safePage = Math.max(page, 1);

    const conditions: SQL[] = [];
    if (courseId) conditions.push(eq(attendanceSummaries.courseId, courseId));
    if (academicYearId)
      conditions.push(eq(attendanceSummaries.academicYearId, academicYearId));
    if (facultyId) conditions.push(eq(students.facultyId, facultyId));
    if (departmentId) conditions.push(eq(students.departmentId, departmentId));
    if (generation) conditions.push(eq(students.generation, generation));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          studentId: attendanceSummaries.studentId,
          name: user.name,
          gender: students.gender,
          phone: students.phone,
          status: students.educationalStatus,
          total: attendanceSummaries.totalAttendance,
          present: attendanceSummaries.presentAttendance,
          absent: attendanceSummaries.absentAttendance,
          late: attendanceSummaries.lateAttendance,
          leave: attendanceSummaries.excusedAttendance,
          presentPct: attendanceSummaries.presentPercentage,
          absentPct: attendanceSummaries.absentPercentage,
          latePct: attendanceSummaries.latePercentage,
          excusedPct: attendanceSummaries.excusedPercentage,
          withdrawFromExam: attendanceSummaries.withdrawFromExam,
          makeUpClass: attendanceSummaries.makeUpClass,
          courseName: courses.name,
          score: sql<number>`GREATEST(0, 10 - (${attendanceSummaries.absentAttendance} * 0.5 + ${attendanceSummaries.excusedAttendance} * 0.25))`,
        })
        .from(attendanceSummaries)
        .innerJoin(students, eq(students.id, attendanceSummaries.studentId))
        .innerJoin(user, eq(students.userId, user.id))
        .innerJoin(courses, eq(courses.id, attendanceSummaries.courseId))
        .where(whereClause)
        .orderBy(asc(user.name))
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit),

      this.db
        .select({ count: sql<string>`count(*)`.as("count") })
        .from(attendanceSummaries)
        .innerJoin(students, eq(students.id, attendanceSummaries.studentId))
        .where(whereClause),
    ]);

    return {
      data,
      total: Number(countResult[0]?.count ?? "0"),
      page: safePage,
      limit: safeLimit,
    };
  }

  async incrementAttendanceSummary(
    studentId: number,
    courseId: number,
    academicYearId: number,
    facultyId: number,
    departmentId: number,
    status: "present" | "absent" | "late" | "excused",
    totalCourseSessions: number,
    sessionsRemaining: number,
    tx?: Transaction,
  ) {
    const client = tx ?? this.db;
    await client
      .insert(attendanceSummaries)
      .values({
        studentId,
        courseId,
        academicYearId,
        facultyId,
        departmentId,
        totalAttendance: 1,
        presentAttendance: status === "present" ? 1 : 0,
        absentAttendance: status === "absent" ? 1 : 0,
        lateAttendance: status === "late" ? 1 : 0,
        excusedAttendance: status === "excused" ? 1 : 0,
        totalCourseSessions,
        sessionsRemaining,
        presentPercentage: 0,
        absentPercentage: 0,
        latePercentage: 0,
        excusedPercentage: 0,
        withdrawFromExam: false,
        makeUpClass: false,
      })
      .onConflictDoUpdate({
        target: [
          attendanceSummaries.studentId,
          attendanceSummaries.courseId,
          attendanceSummaries.academicYearId,
        ],
        set: {
          totalAttendance: sql`${attendanceSummaries.totalAttendance} + 1`,
          presentAttendance: sql`${attendanceSummaries.presentAttendance} + ${status === "present" ? 1 : 0}`,
          absentAttendance: sql`${attendanceSummaries.absentAttendance}  + ${status === "absent" ? 1 : 0}`,
          lateAttendance: sql`${attendanceSummaries.lateAttendance}    + ${status === "late" ? 1 : 0}`,
          excusedAttendance: sql`${attendanceSummaries.excusedAttendance} + ${status === "excused" ? 1 : 0}`,
          sessionsRemaining: sql`${attendanceSummaries.sessionsRemaining} - 1`,
          updatedAt: new Date(),
        },
      });
  }

  async recalculateSummaryPercentages(
    studentId: number,
    courseId: number,
    academicYearId: number,
    tx?: Transaction,
  ) {
    const client = tx ?? this.db;
    await client
      .update(attendanceSummaries)
      .set({
        presentPercentage: sql`ROUND((${attendanceSummaries.presentAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100, 2)`,
        absentPercentage: sql`ROUND((${attendanceSummaries.absentAttendance}::numeric  / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100, 2)`,
        latePercentage: sql`ROUND((${attendanceSummaries.lateAttendance}::numeric    / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100, 2)`,
        excusedPercentage: sql`ROUND((${attendanceSummaries.excusedAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100, 2)`,
        withdrawFromExam: sql`
        ((${attendanceSummaries.excusedAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 >= 30 AND (${attendanceSummaries.excusedAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 < 60)
        OR ((${attendanceSummaries.absentAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 >= 20 AND (${attendanceSummaries.absentAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 < 30)
        OR (((${attendanceSummaries.absentAttendance} + ${attendanceSummaries.excusedAttendance})::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 >= 25 AND ((${attendanceSummaries.absentAttendance} + ${attendanceSummaries.excusedAttendance})::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 < 30)
      `,
        makeUpClass: sql`
        ((${attendanceSummaries.excusedAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 >= 60 AND (${attendanceSummaries.excusedAttendance}::numeric / NULLIF(${attendanceSummaries.totalCourseSessions}, 0)) * 100 <= 100)
      `,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(attendanceSummaries.studentId, studentId),
          eq(attendanceSummaries.courseId, courseId),
          eq(attendanceSummaries.academicYearId, academicYearId),
        ),
      );
  }

  async adjustAttendanceSummary(
    studentId: number,
    courseId: number,
    academicYearId: number,
    oldStatus: "present" | "absent" | "late" | "excused",
    newStatus: "present" | "absent" | "late" | "excused",
    tx?: Transaction,
  ) {
    if (oldStatus === newStatus) return;
    const client = tx ?? this.db;

    const delta = (col: "present" | "absent" | "late" | "excused") => {
      const wasThis = oldStatus === col ? 1 : 0;
      const isThis = newStatus === col ? 1 : 0;
      const diff = isThis - wasThis;
      if (diff === 0) return sql`${attendanceSummaries[`${col}Attendance`]}`;
      if (diff === 1)
        return sql`${attendanceSummaries[`${col}Attendance`]} + 1`;
      return sql`${attendanceSummaries[`${col}Attendance`]} - 1`;
    };

    await client
      .update(attendanceSummaries)
      .set({
        presentAttendance: delta("present"),
        absentAttendance: delta("absent"),
        lateAttendance: delta("late"),
        excusedAttendance: delta("excused"),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(attendanceSummaries.studentId, studentId),
          eq(attendanceSummaries.courseId, courseId),
          eq(attendanceSummaries.academicYearId, academicYearId),
        ),
      );
  }

  async getAttendanceSummaryByStudentId(studentId: number) {
    return this.db
      .select({
        courseId: attendanceSummaries.courseId,
        courseName: courses.name,
        total: attendanceSummaries.totalAttendance,
        present: attendanceSummaries.presentAttendance,
        absent: attendanceSummaries.absentAttendance,
        late: attendanceSummaries.lateAttendance,
        excused: attendanceSummaries.excusedAttendance,
        presentPct: attendanceSummaries.presentPercentage,
        absentPct: attendanceSummaries.absentPercentage,
        latePct: attendanceSummaries.latePercentage,
        excusedPct: attendanceSummaries.excusedPercentage,
        withdrawFromExam: attendanceSummaries.withdrawFromExam,
        makeUpClass: attendanceSummaries.makeUpClass,
      })
      .from(attendanceSummaries)
      .innerJoin(courses, eq(courses.id, attendanceSummaries.courseId))
      .where(eq(attendanceSummaries.studentId, studentId));
  }
}

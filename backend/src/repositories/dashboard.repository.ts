import { eq, sql, desc, inArray, and } from "drizzle-orm";
import {
  user,
  students,
  teachers,
  departments,
  attendanceSummaries,
  courses,
  schedules,
  academicYears,
  sessionTimes,
  classrooms,
  buildings,
} from "../database/schemas";
import { type DrizzleDb } from "@/database";

export class DashboardRepository {
  constructor(private db: DrizzleDb) {}

  async getCounts() {
    const [staffRes, teacherRes, studentRes, dropoutRes] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(user)
        .where(inArray(user.role, ["manager", "staff"])),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(teachers)
        .where(eq(teachers.isActive, true)),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(students)
        .where(eq(students.educationalStatus, "enrolled")),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(students)
        .where(eq(students.educationalStatus, "dropped_out")),
    ]);

    return {
      staffCount: staffRes[0]?.count ?? 0,
      teacherCount: teacherRes[0]?.count ?? 0,
      studentCount: studentRes[0]?.count ?? 0,
      dropoutCount: dropoutRes[0]?.count ?? 0,
    };
  }

  async getStudentsByDepartment() {
    const res = await this.db
      .select({
        name: departments.name,
        value: sql<number>`count(${students.id})::int`,
      })
      .from(students)
      .innerJoin(departments, eq(students.departmentId, departments.id))
      .where(eq(students.educationalStatus, "enrolled"))
      .groupBy(departments.id, departments.name);

    return res;
  }

  async getAttendanceTrend() {
    // past 7 days
    const res = await this.db.execute(sql`
      SELECT 
        to_char(date, 'Day') AS day,
        COUNT(*)::int AS count
      FROM attendance_records
      WHERE status = 'present' AND date >= current_date - interval '7 days'
      GROUP BY date
      ORDER BY date ASC;
    `);

    return res.rows.map((r) => ({
      day: String(r.day).trim(),
      count: Number(r.count),
    }));
  }

  async getTopAttendance() {
    const res = await this.db
      .select({
        name: user.name,
        gender: students.gender,
        department: departments.name,
        percentage: attendanceSummaries.presentPercentage,
      })
      .from(attendanceSummaries)
      .innerJoin(students, eq(attendanceSummaries.studentId, students.id))
      .innerJoin(user, eq(students.userId, user.id))
      .innerJoin(
        departments,
        eq(attendanceSummaries.departmentId, departments.id),
      )
      .orderBy(desc(attendanceSummaries.presentPercentage))
      .limit(4);

    return res;
  }

  async getStudentStats(studentId: number) {
    let currentYear = await this.db.query.academicYears.findFirst({
      where: eq(academicYears.isCurrent, true),
    });

    if (!currentYear) {
      currentYear = await this.db.query.academicYears.findFirst({
        orderBy: desc(academicYears.id),
      });
    }

    if (!currentYear) return null;

    const student = await this.db.query.students.findFirst({
      where: eq(students.id, studentId),
    });

    if (!student) return null;

    const res = await this.db
      .select({
        id: courses.id,
        day: courses.day,
        totalSessionLeft: courses.totalSessionLeft,
      })
      .from(courses)
      .innerJoin(schedules, eq(courses.scheduleId, schedules.id))
      .where(
        and(
          eq(schedules.departmentId, student.departmentId!),
          eq(schedules.academicLevelId, student.academicLevelId!),
          eq(schedules.academicYearId, currentYear.id),
          eq(schedules.semester, student.semester)
        )
      );

    const totalSubjects = res.length;
    const completed = res.filter((c) => Number(c.totalSessionLeft) === 0).length;
    
    // Total classes - let's assume total subjects for now as a simplified stat
    // Or we could count total sessions if we had that data.
    const totalClasses = totalSubjects * 12; // Example multiplier for semester weeks

    const currentDay = sql`trim(to_char(current_date, 'Day'))::day`;
    const todayRes = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(courses)
      .innerJoin(schedules, eq(courses.scheduleId, schedules.id))
      .where(
        and(
          eq(schedules.departmentId, student.departmentId!),
          eq(schedules.academicLevelId, student.academicLevelId!),
          eq(schedules.academicYearId, currentYear.id),
          eq(schedules.semester, student.semester),
          eq(courses.day, currentDay)
        )
      );

    return {
      totalSubjects,
      completed,
      totalClasses,
      todayClasses: todayRes[0]?.count ?? 0,
    };
  }

  async getTeacherStats(teacherId: number) {
    let currentYear = await this.db.query.academicYears.findFirst({
      where: eq(academicYears.isCurrent, true),
    });

    if (!currentYear) {
      currentYear = await this.db.query.academicYears.findFirst({
        orderBy: desc(academicYears.id),
      });
    }

    if (!currentYear) return null;

    const res = await this.db
      .select({
        id: courses.id,
        day: courses.day,
        totalSessionLeft: courses.totalSessionLeft,
      })
      .from(courses)
      .where(
        and(
          eq(courses.teacherId, teacherId),
          eq(courses.academicYearId, currentYear.id)
        )
      );

    const totalSubjects = res.length;
    const completed = res.filter((c) => Number(c.totalSessionLeft) === 0).length;
    const totalClasses = totalSubjects * 12;

    const currentDay = sql`trim(to_char(current_date, 'Day'))::day`;
    const todayRes = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(courses)
      .where(
        and(
          eq(courses.teacherId, teacherId),
          eq(courses.academicYearId, currentYear.id),
          eq(courses.day, currentDay)
        )
      );

    return {
      totalSubjects,
      completed,
      totalClasses,
      todayClasses: todayRes[0]?.count ?? 0,
    };
  }

  async getCurrentClassForStudent(studentId: number) {
    const student = await this.db.query.students.findFirst({
      where: eq(students.id, studentId),
    });
    if (!student) return null;

    const currentDay = sql`trim(to_char(current_date, 'Day'))::day`;
    const currentTime = sql`to_char(current_timestamp, 'HH24:MI')`;

    const res = await this.db
      .select({
        name: courses.name,
        session: courses.session,
        startTime1: sessionTimes.firstSessionStartTime,
        endTime1: sessionTimes.firstSessionEndTime,
        startTime2: sessionTimes.secondSessionStartTime,
        endTime2: sessionTimes.secondSessionEndTime,
        room: classrooms.name,
        building: buildings.name,
      })
      .from(courses)
      .innerJoin(schedules, eq(courses.scheduleId, schedules.id))
      .innerJoin(sessionTimes, eq(schedules.sessionTimeId, sessionTimes.id))
      .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
      .innerJoin(buildings, eq(classrooms.buildingId, buildings.id))
      .where(
        and(
          eq(schedules.departmentId, student.departmentId!),
          eq(schedules.academicLevelId, student.academicLevelId!),
          eq(courses.day, currentDay),
          sql`${currentTime} BETWEEN 
            CASE WHEN ${courses.session} = 1 THEN ${sessionTimes.firstSessionStartTime} ELSE ${sessionTimes.secondSessionStartTime} END 
            AND 
            CASE WHEN ${courses.session} = 1 THEN ${sessionTimes.firstSessionEndTime} ELSE ${sessionTimes.secondSessionEndTime} END`
        )
      )
      .limit(1);

    if (res.length === 0) return null;

    const item = res[0]!;
    return {
      name: item.name,
      startTime: item.session === 1 ? item.startTime1 : item.startTime2,
      endTime: item.session === 1 ? item.endTime1 : item.endTime2,
      room: item.room,
      building: item.building,
    };
  }

  async getCurrentClassForTeacher(teacherId: number) {
    const currentDay = sql`trim(to_char(current_date, 'Day'))::day`;
    const currentTime = sql`to_char(current_timestamp, 'HH24:MI')`;

    const res = await this.db
      .select({
        name: courses.name,
        session: courses.session,
        startTime1: sessionTimes.firstSessionStartTime,
        endTime1: sessionTimes.firstSessionEndTime,
        startTime2: sessionTimes.secondSessionStartTime,
        endTime2: sessionTimes.secondSessionEndTime,
        room: classrooms.name,
        building: buildings.name,
      })
      .from(courses)
      .innerJoin(schedules, eq(courses.scheduleId, schedules.id))
      .innerJoin(sessionTimes, eq(schedules.sessionTimeId, sessionTimes.id))
      .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
      .innerJoin(buildings, eq(classrooms.buildingId, buildings.id))
      .where(
        and(
          eq(courses.teacherId, teacherId),
          eq(courses.day, currentDay),
          sql`${currentTime} BETWEEN 
            CASE WHEN ${courses.session} = 1 THEN ${sessionTimes.firstSessionStartTime} ELSE ${sessionTimes.secondSessionStartTime} END 
            AND 
            CASE WHEN ${courses.session} = 1 THEN ${sessionTimes.firstSessionEndTime} ELSE ${sessionTimes.secondSessionEndTime} END`
        )
      )
      .limit(1);

    if (res.length === 0) return null;

    const item = res[0]!;
    return {
      name: item.name,
      startTime: item.session === 1 ? item.startTime1 : item.startTime2,
      endTime: item.session === 1 ? item.endTime1 : item.endTime2,
      room: item.room,
      building: item.building,
    };
  }
}

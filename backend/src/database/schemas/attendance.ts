import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  uniqueIndex,
  date,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { attendanceStatusEnum } from "./enums";
import {
  academicYears,
  courses,
  departments,
  faculties,
  students,
  teachers,
} from "./academic";

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull().default("absent"),
    session: integer("session").notNull(),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    notes: varchar("notes", { length: 500 }),
    recordedBy: integer("recorded_by").references(() => teachers.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_attendance_record").on(
      table.courseId,
      table.studentId,
      table.date,
      table.session,
    ),
  ],
);

export const attendanceSummaries = pgTable(
  "attendance_summaries",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    facultyId: integer("faculty_id")
      .notNull()
      .references(() => faculties.id),
    departmentId: integer("department_id")
      .notNull()
      .references(() => departments.id),
    totalAttendance: integer("total_attendance").notNull().default(0),
    presentAttendance: integer("present_attendance").notNull().default(0),
    absentAttendance: integer("absent_attendance").notNull().default(0),
    lateAttendance: integer("late_attendance").notNull().default(0),
    excusedAttendance: integer("excused_attendance").notNull().default(0),
    presentPercentage: real("present_percentage").notNull().default(0),
    absentPercentage: real("absent_percentage").notNull().default(0),
    latePercentage: real("late_percentage").notNull().default(0),
    excusedPercentage: real("excused_percentage").notNull().default(0),
    withdrawFromExam: boolean("withdraw_from_exam").notNull().default(false),
    makeUpClass: boolean("make_up_class").notNull().default(false),
    totalCourseSessions: integer("total_course_sessions").notNull().default(0),
    sessionsRemaining: integer("sessions_remaining").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_attendance_summary").on(
      table.studentId,
      table.courseId,
      table.academicYearId,
    ),
  ],
);

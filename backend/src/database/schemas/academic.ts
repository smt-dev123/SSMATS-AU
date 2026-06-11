import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  index,
  text,
  unique,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import {
  academicLevel,
  dayEnum,
  educationalStatus,
  gender,
  studyShiftEnum,
} from "./enums";
import { user } from "./authentication";
import { classrooms } from "./infrastructure";

export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isCurrent: boolean("is_current").default(false),
});

export const faculties = pgTable("faculties", {
  id: serial("id").primaryKey(),
  name: varchar("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departments = pgTable(
  "departments",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").unique().notNull(),
    facultyId: integer("faculty_id")
      .notNull()
      .references(() => faculties.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_faculty_department").on(table.facultyId, table.name),
  ],
);

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name").unique().notNull(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => faculties.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessionTimes = pgTable(
  "session_times",
  {
    id: serial("id").primaryKey(),
    shift: studyShiftEnum("shift").unique().notNull(),
    firstSessionStartTime: varchar("first_session_start_time").notNull(),
    firstSessionEndTime: varchar("first_session_end_time").notNull(),
    secondSessionStartTime: varchar("second_session_start_time").notNull(),
    secondSessionEndTime: varchar("second_session_end_time").notNull(),
    description: varchar("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("unique_session_time").on(
      table.shift,
      table.firstSessionStartTime,
      table.firstSessionEndTime,
      table.secondSessionStartTime,
      table.secondSessionEndTime,
    ),
  ],
);

export const academicLevels = pgTable("academic_levels", {
  id: serial("id").primaryKey(),
  level: academicLevel("level").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schedules = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(),
    facultyId: integer("faculty_id")
      .notNull()
      .references(() => faculties.id),
    year: integer("year").notNull(),
    academicLevelId: integer("academic_level_id")
      .notNull()
      .references(() => academicLevels.id),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    generation: integer("generation").notNull(),
    departmentId: integer("department_id")
      .notNull()
      .references(() => departments.id),
    semester: integer("semester").notNull(),
    semesterStart: timestamp("semester_start").notNull(),
    semesterEnd: timestamp("semester_end").notNull(),
    studyShift: studyShiftEnum("study_shift").notNull().default("morning"),
    classroomId: integer("classroom_id")
      .notNull()
      .references(() => classrooms.id),
    sessionTimeId: integer("session_time_id")
      .notNull()
      .references(() => sessionTimes.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_schedule_identifier").on(
      table.facultyId,
      table.academicLevelId,
      table.generation,
      table.semester,
      table.year,
      table.departmentId,
      table.studyShift,
    ),
    index("idx_schedule_faculty_generation").on(
      table.facultyId,
      table.generation,
    ),
  ],
);

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    code: varchar("code").unique(),
    credits: integer("credits"),
    description: varchar("description"),
    day: dayEnum("day").notNull(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id),
    scheduleId: integer("schedule_id")
      .notNull()
      .references(() => schedules.id),
    hours: numeric("hours", { precision: 4, scale: 1 }).notNull(),
    session: integer("session").notNull(),
    totalHoursLeft: numeric("total_hours_left", {
      precision: 4,
      scale: 1,
    }).notNull(),
    totalSessionLeft: integer("total_session_left").notNull(),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_course_teacher").on(table.teacherId),
    index("idx_course_schedule").on(table.scheduleId),
    index("idx_course_day_schedule").on(table.day, table.scheduleId),
    uniqueIndex("unique_schedule_day_classroom_time").on(
      table.scheduleId,
      table.day,
    ),
  ],
);

export const teachers = pgTable(
  "teachers",
  {
    id: integer("id").primaryKey(),
    teacherCode: varchar("teacher_code").unique().notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    academicLevelId: integer("academic_level_id")
      .references(() => academicLevels.id)
      .notNull(),
    facultyId: integer("faculty_id")
      .references(() => faculties.id)
      .notNull(),
    phone: text("phone"),
    address: text("address"),
    gender: gender("gender"),
    dob: timestamp("dob"),
    image: text("image"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_teacher_faculty").on(table.facultyId)],
);

export const students = pgTable(
  "students",
  {
    id: integer("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    facultyId: integer("faculty_id").references(() => faculties.id),
    departmentId: integer("department_id").references(() => departments.id),
    academicLevelId: integer("academic_level_id").references(
      () => academicLevels.id,
    ),
    academicYearId: integer("academic_year_id").references(
      () => academicYears.id,
    ),
    skillId: integer("skill_id")
      .references(() => skills.id)
      .notNull(),
    educationalStatus: educationalStatus("educational_status").notNull(),
    generation: integer("generation").notNull(),
    semester: integer("semester").notNull(),
    phone: text("phone"),
    address: text("address"),
    gender: gender("gender"),
    dob: timestamp("dob"),
    image: text("image"),
    isActive: boolean("is_active").default(true),
    studentCode: varchar("student_code").unique().notNull(),
    year: integer("year"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_student_schedule_filter").on(
      table.facultyId,
      table.academicLevelId,
      table.generation,
      table.semester,
    ),
  ],
);

export const studentAcademicYears = pgTable(
  "student_academic_years",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    semester: integer("semester").notNull().default(1),
    year: integer("year").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_student_enrollment").on(
      table.studentId,
      table.academicYearId,
      table.semester,
      table.year,
    ),
  ],
);

export const scheduleOverrides = pgTable(
  "schedule_overrides",
  {
    id: serial("id").primaryKey(),
    originalCourseId: integer("original_course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    replacementTeacherId: integer("replacement_teacher_id").references(
      () => teachers.id,
      { onDelete: "set null" },
    ),
    replacementClassroomId: integer("replacement_classroom_id").references(
      () => classrooms.id,
      { onDelete: "set null" },
    ),
    isCancelled: boolean("is_cancelled").default(false),
    note: varchar("note"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_schedule_override").on(
      table.originalCourseId,
      table.date,
    ),
  ],
);

import { students } from "@/database/schemas";
import z from "zod";
import { createUpdateSchema } from "drizzle-zod";

/* Enum */
const academicLevelEnum = z.enum(["Associate", "Bachelor", "Master", "PhD"]);
const genderEnum = z.enum(["male", "female"]);
const educationalStatusEnum = z.enum([
  "enrolled",
  "suspended",
  "graduated",
  "dropped_out",
  "transferred",
]);
const dayEnum = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);
const studyShiftEnum = z.enum(["morning", "evening", "night"]);

/* Helpers */
const zBoolean = z.preprocess((v) => {
  if (typeof v === "string") {
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return v;
}, z.boolean());

/* Faculty Schemas */
export const facultySchema = z.object({
  name: z.string().min(1, "Faculty name is required"),
});
export const facultyUpdateSchema = facultySchema.partial();

export type FacultyInput = z.infer<typeof facultySchema>;
export type FacultyUpdateInput = z.infer<typeof facultyUpdateSchema>;

/* Academic Level Schemas */
export const academicLevelSchema = z.object({
  level: academicLevelEnum,
});
export const academicLevelUpdateSchema = academicLevelSchema.partial();

export type AcademicLevelInput = z.infer<typeof academicLevelSchema>;
export type AcademicLevelUpdateInput = z.infer<
  typeof academicLevelUpdateSchema
>;

/* Academic Year Schemas */
export const academicYearSchema = z.object({
  name: z.string().min(1, "Academic year name is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: zBoolean.default(false),
});
export const academicYearUpdateSchema = academicYearSchema.partial();

export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type AcademicYearUpdateInput = z.infer<typeof academicYearUpdateSchema>;

/* Department Schemas */
export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  facultyId: z.coerce.number().positive(),
});
export const departmentUpdateSchema = departmentSchema.partial();

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;

/* Student Schemas */
export const studentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameEn: z.string().min(1, "English name is required"),
  studentCode: z.string().min(1, "Student code is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10).max(15),
  dob: z.coerce.date().optional(),
  address: z.string().optional(),
  facultyId: z.coerce.number().positive(),
  departmentId: z.coerce.number().positive(),
  academicLevelId: z.coerce.number().positive(),
  educationalStatus: educationalStatusEnum,
  gender: genderEnum,
  generation: z.coerce.number().positive(),
  skillId: z.coerce.number().positive(),
  semester: z.coerce.number().positive(),
  isActive: zBoolean.default(true),
  academicYearId: z.coerce.number().positive(),
  year: z.coerce.number().positive(),
});

export const studentUpdateSchema = studentCreateSchema.partial().omit({
  password: true,
});
export const studentQuerySchema = z.object({
  name: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  academicLevelId: z.string().optional(),
  academicYearId: z.string().optional(),
  semester: z.string().optional(),
  year: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
export const studentIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

export const studentPromoteSchema = z.object({
  studentId: z.coerce.number().positive(),
  academicYearId: z.coerce.number().positive(),
  year: z.coerce.number().positive(),
  semester: z.coerce.number().positive(),
});
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;

export const teacherCreateSchema = z.object({
  teacherCode: z.string().min(1, "Teacher code is required"),
  name: z.string().min(1, "Teacher name is required"),
  nameEn: z.string().min(1, "English name is required"),
  phone: z.string().min(10).max(15),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: genderEnum,
  address: z.string().optional(),
  dob: z.coerce.date().optional(),
  academicLevelId: z.coerce.number().positive(),
  facultyId: z.coerce.number().positive(),
  isActive: zBoolean.default(true),
});
export const teacherUpdateSchema = teacherCreateSchema.partial().omit({
  password: true,
});
export const teacherQuerySchema = z.object({
  name: z.string().optional(),
  teacherCode: z.string().optional(),
  academicLevelId: z.coerce.number().optional(),
  facultyId: z.coerce.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
});
export const teacherIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

/* Course Schemas */
export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  credits: z.coerce.number().positive(),
  description: z.string().optional(),
  day: dayEnum,
  teacherId: z.coerce.number().positive(),
  scheduleId: z.coerce.number().positive(),
  hours: z.string().min(1, "Hours is required"),
  academicYearId: z.coerce.number().positive(),
  isActive: zBoolean.default(true),
});
export const courseUpdateSchema = courseSchema.partial();
export const courseQuerySchema = z.object({
  name: z.string().optional(),
  academicYearId: z.coerce.number().optional(),
  teacherId: z.coerce.number().optional(),
  studentId: z.coerce.number().optional(),
  facultyId: z.coerce.number().optional(),
  departmentId: z.coerce.number().optional(),
  academicLevelId: z.coerce.number().optional(),
  generation: z.coerce.number().optional(),
  semester: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;

/* Session Time Schemas */
export const sessionTimeSchema = z.object({
  shift: studyShiftEnum,
  firstSessionStartTime: z
    .string()
    .min(1, "First session start time is required"),
  firstSessionEndTime: z.string().min(1, "First session end time is required"),
  secondSessionStartTime: z
    .string()
    .min(1, "Second session start time is required"),
  secondSessionEndTime: z
    .string()
    .min(1, "Second session end time is required"),
  description: z.string().optional(),
  isActive: zBoolean.default(true),
});
export const sessionTimeUpdateSchema = sessionTimeSchema.partial();

export type SessionTimeInput = z.infer<typeof sessionTimeSchema>;
export type SessionTimeUpdateInput = z.infer<typeof sessionTimeUpdateSchema>;

/* Schedule Schemas */
export const scheduleSchema = z.object({
  facultyId: z.coerce.number().positive(),
  year: z.coerce.number().positive(),
  academicLevelId: z.coerce.number().positive(),
  generation: z.coerce.number().positive(),
  departmentId: z.coerce.number().positive(),
  classroomId: z.coerce.number().positive(),
  semester: z.coerce.number().positive(),
  semesterStart: z.coerce.date(),
  semesterEnd: z.coerce.date(),
  academicYearId: z.coerce.number().positive(),
  studyShift: studyShiftEnum,
  sessionTimeId: z.coerce.number().positive(),
});

export const scheduleUniqueKeySchema = z.object({
  facultyId: z.coerce.number().positive(),
  year: z.coerce.number().positive(),
  academicLevelId: z.coerce.number().positive(),
  generation: z.coerce.number().positive(),
  departmentId: z.coerce.number().positive(),
  semester: z.coerce.number().positive(),
  studyShift: studyShiftEnum,
});
export const scheduleUpdateSchema = scheduleSchema.partial();
export const scheduleQuerySchema = z.object({
  name: z.string().optional(),
  academicYearId: z.coerce.number().optional(),
  facultyId: z.coerce.number().optional(),
  departmentId: z.coerce.number().optional(),
  academicLevelId: z.coerce.number().optional(),
});

export const scheduleWithCoursesSchema = z.object({
  schedule: scheduleSchema,
  courses: z.array(
    courseSchema.omit({ scheduleId: true, academicYearId: true }),
  ),
});

export const scheduleUpdateWithCoursesSchema = z.object({
  schedule: scheduleSchema.partial(),
  courses: z
    .array(
      z.object({
        id: z.coerce.number().optional(),
        name: z.string().min(1, "Course name is required"),
        code: z.string().min(1, "Course code is required"),
        credits: z.coerce.number().positive(),
        day: dayEnum,
        teacherId: z.coerce.number().positive(),
        hours: z.string().min(1, "Hours is required"),
        isActive: zBoolean.default(true),
      }),
    )
    .optional(),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;
export type ScheduleUniqueKeyInput = z.infer<typeof scheduleUniqueKeySchema>;
export type ScheduleWithCoursesInput = z.infer<
  typeof scheduleWithCoursesSchema
>;
export type ScheduleUpdateWithCoursesInput = z.infer<
  typeof scheduleUpdateWithCoursesSchema
>;

/* Skill Schemas */
export const skillCreateSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  facultyId: z.coerce.number().positive(),
  description: z.string().optional(),
});
export const skillUpdateSchema = skillCreateSchema.partial();
export const skillQuerySchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
});
export const skillIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

/* Schedule Override Schemas */
export const scheduleOverrideSchema = z.object({
  originalCourseId: z.coerce.number().positive(),
  date: z.string(), // Drizzle date type expects string YYYY-MM-DD
  replacementTeacherId: z.coerce.number().positive().nullable().optional(),
  replacementClassroomId: z.coerce.number().positive().nullable().optional(),
  isCancelled: zBoolean.default(false),
  note: z.string().nullable().optional(),
});
export const scheduleOverrideUpdateSchema = scheduleOverrideSchema.partial();
export const scheduleOverrideQuerySchema = z.object({
  date: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
});
export const scheduleOverrideIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

export type ScheduleOverrideInput = z.infer<typeof scheduleOverrideSchema>;
export type ScheduleOverrideUpdateInput = z.infer<
  typeof scheduleOverrideUpdateSchema
>;

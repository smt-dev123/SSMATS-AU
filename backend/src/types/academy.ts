import {
  academicLevels,
  academicYears,
  courses,
  departments,
  faculties,
  schedules,
  sessionTimes,
  skills,
  students,
  teachers,
} from "@/database/schemas";
import type { Building, Classroom } from "./infrastructure";
import type z from "zod";
import type {
  teacherQuerySchema,
  teacherUpdateSchema,
} from "@/validators/academy";

/* Student */
export type Student = Omit<
  typeof students.$inferSelect,
  "createdAt" | "updatedAt" | "userId"
> & {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  gender: "male" | "female";
  dob?: Date | string | null;
};

export type CreateStudent = {
  facultyId: number;
  departmentId: number;
  academicLevelId: number;
  educationalStatus: "enrolled" | "suspended" | "graduated" | "dropped_out" | "transferred";
  generation: number;
  semester: number;
  academicYearId: number;
  isActive: boolean;
  userId: string;
  skillId: number;
  year?: number;
  studentCode: string;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  gender?: "male" | "female";
  dob?: Date | string | null;
};

export type StudentPromoteInput = {
  studentId: number;
  academicYearId: number;
  year: number;
  semester: number;
};

/* Teacher */
export type Teacher = typeof teachers.$inferSelect & {
  name: string;
  email: string;
};

export type CreateTeacher = {
  teacherCode: string;
  academicLevelId: number;
  facultyId: number;
  isActive: boolean;
  userId: string;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  gender?: "male" | "female";
  dob?: Date | string | null;
};

export type UpdateTeacher = Partial<CreateTeacher>;

export type TeacherQueryInput = {
  page: number;
  limit: number;
  name?: string;
  academicLevelId?: number;
  facultyId?: string;
};

/* Faculty */
export type Faculty = typeof faculties.$inferSelect;

/* Academic Level */
export type AcademicLevel = typeof academicLevels.$inferSelect;

/* Department */
export type Department = typeof departments.$inferSelect;

/* Course */
export type Course = typeof courses.$inferSelect;

/* Session Time */
export type SessionTime = typeof sessionTimes.$inferSelect;

/* Schedule */
export type Schedule = typeof schedules.$inferSelect;

export type ScheduleByAcademicIsCurrent = Pick<
  Schedule,
  "generation" | "semester" | "semesterStart" | "semesterEnd" | "studyShift"
> & {
  faculty: Pick<Faculty, "name">;
  department: Pick<Department, "name">;
  classroom: Pick<Classroom, "name"> & {
    building: Pick<Building, "name">;
  };
  academicLevel: Pick<AcademicLevel, "level">;
  courses: (Pick<Course, "name" | "code" | "credits" | "day" | "hours"> & {
    sessionTime: Pick<
      SessionTime,
      | "shift"
      | "firstSessionStartTime"
      | "firstSessionEndTime"
      | "secondSessionStartTime"
      | "secondSessionEndTime"
    >;
    teacher: {
      name: string;
      phone: string | null;
    };
  })[];
};

/* Academic Year */
export type AcademicYear = typeof academicYears.$inferSelect;

/* Skill */
export type Skill = typeof skills.$inferSelect;
export type CreateSkill = {
  name: string;
  facultyId: number;
  description?: string;
};
export type UpdateSkill = {
  name?: string;
  facultyId?: number;
  description?: string;
};
export type SkillQueryInput = {
  name?: string;
  facultyId?: number;
  page?: number;
  limit?: number;
};

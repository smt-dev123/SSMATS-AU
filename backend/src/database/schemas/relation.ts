import { relations } from "drizzle-orm";
import { user, session, account, twoFactor } from "./authentication";
import {
  faculties,
  departments,
  academicLevels,
  schedules,
  teachers,
  students,
  sessionTimes,
  academicYears,
  studentAcademicYears,
  skills,
  scheduleOverrides,
} from "./academic";
import { buildings, classrooms } from "./infrastructure";
import { courses } from "./academic";
import { attendanceRecords } from "./attendance";
import { notifications, notificationRecipients } from "./notification";

// Auth Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

// Academic Relations
export const facultiesRelations = relations(faculties, ({ many }) => ({
  departments: many(departments),
  teachers: many(teachers),
  schedules: many(schedules),
  students: many(students),
  notifications: many(notifications),
  skills: many(skills),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  faculty: one(faculties, {
    fields: [departments.facultyId],
    references: [faculties.id],
  }),
  schedules: many(schedules),
  notifications: many(notifications),
}));

export const academicLevelsRelations = relations(
  academicLevels,
  ({ many }) => ({
    schedules: many(schedules),
    students: many(students),
    teachers: many(teachers),
  }),
);

export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  schedules: many(schedules),
  students: many(students),
  studentAcademicYears: many(studentAcademicYears),
  attendanceRecords: many(attendanceRecords),
  courses: many(courses),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  faculty: one(faculties, {
    fields: [schedules.facultyId],
    references: [faculties.id],
  }),
  department: one(departments, {
    fields: [schedules.departmentId],
    references: [departments.id],
  }),
  academicLevel: one(academicLevels, {
    fields: [schedules.academicLevelId],
    references: [academicLevels.id],
  }),
  academicYear: one(academicYears, {
    fields: [schedules.academicYearId],
    references: [academicYears.id],
  }),
  courses: many(courses),
  classroom: one(classrooms, {
    fields: [schedules.classroomId],
    references: [classrooms.id],
  }),
  sessionTime: one(sessionTimes, {
    fields: [schedules.sessionTimeId],
    references: [sessionTimes.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(user, {
    fields: [teachers.userId],
    references: [user.id],
  }),
  faculty: one(faculties, {
    fields: [teachers.facultyId],
    references: [faculties.id],
  }),
  academicLevel: one(academicLevels, {
    fields: [teachers.academicLevelId],
    references: [academicLevels.id],
  }),
  courses: many(courses),
  attendanceRecords: many(attendanceRecords),
  scheduleOverrides: many(scheduleOverrides),
  notificationRecipients: many(notificationRecipients),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(user, {
    fields: [students.userId],
    references: [user.id],
  }),
  academicLevel: one(academicLevels, {
    fields: [students.academicLevelId],
    references: [academicLevels.id],
  }),
  faculty: one(faculties, {
    fields: [students.facultyId],
    references: [faculties.id],
  }),
  department: one(departments, {
    fields: [students.departmentId],
    references: [departments.id],
  }),
  skill: one(skills, {
    fields: [students.skillId],
    references: [skills.id],
  }),
  academicYear: one(academicYears, {
    fields: [students.academicYearId],
    references: [academicYears.id],
  }),
  studentAcademicYears: many(studentAcademicYears),
  notificationRecipients: many(notificationRecipients),
  attendanceRecords: many(attendanceRecords),
}));

export const studentAcademicYearsRelations = relations(
  studentAcademicYears,
  ({ one }) => ({
    student: one(students, {
      fields: [studentAcademicYears.studentId],
      references: [students.id],
    }),
    academicYear: one(academicYears, {
      fields: [studentAcademicYears.academicYearId],
      references: [academicYears.id],
    }),
  }),
);

export const skillsRelations = relations(skills, ({ one, many }) => ({
  faculty: one(faculties, {
    fields: [skills.facultyId],
    references: [faculties.id],
  }),
  students: many(students),
}));

// Infrastructure Relations
export const buildingsRelations = relations(buildings, ({ many }) => ({
  classrooms: many(classrooms),
}));

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  building: one(buildings, {
    fields: [classrooms.buildingId],
    references: [buildings.id],
  }),
  schedules: many(schedules),
  scheduleOverrides: many(scheduleOverrides),
}));

export const sessionTimesRelations = relations(sessionTimes, ({ many }) => ({
  schedules: many(schedules),
}));

// Course Relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [courses.teacherId],
    references: [teachers.id],
  }),
  schedule: one(schedules, {
    fields: [courses.scheduleId],
    references: [schedules.id],
  }),
  academicYear: one(academicYears, {
    fields: [courses.academicYearId],
    references: [academicYears.id],
  }),
  attendanceRecords: many(attendanceRecords),
  scheduleOverrides: many(scheduleOverrides),
}));

// Attendance Relations
export const attendanceRecordsRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    course: one(courses, {
      fields: [attendanceRecords.courseId],
      references: [courses.id],
    }),
    student: one(students, {
      fields: [attendanceRecords.studentId],
      references: [students.id],
    }),
    recordedByTeacher: one(teachers, {
      fields: [attendanceRecords.recordedBy],
      references: [teachers.id],
    }),
    academicYear: one(academicYears, {
      fields: [attendanceRecords.academicYearId],
      references: [academicYears.id],
    }),
  }),
);

export const notificationsRelations = relations(
  notifications,
  ({ one, many }) => ({
    faculty: one(faculties, {
      fields: [notifications.facultyId],
      references: [faculties.id],
    }),
    department: one(departments, {
      fields: [notifications.targetDepartment],
      references: [departments.id],
    }),
    recipients: many(notificationRecipients),
  }),
);

export const notificationRecipientsRelations = relations(
  notificationRecipients,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationRecipients.notificationId],
      references: [notifications.id],
    }),
    student: one(students, {
      fields: [notificationRecipients.studentId],
      references: [students.id],
    }),
    teacher: one(teachers, {
      fields: [notificationRecipients.teacherId],
      references: [teachers.id],
    }),
  }),
);

export const scheduleOverridesRelations = relations(
  scheduleOverrides,
  ({ one }) => ({
    originalCourse: one(courses, {
      fields: [scheduleOverrides.originalCourseId],
      references: [courses.id],
    }),
    replacementTeacher: one(teachers, {
      fields: [scheduleOverrides.replacementTeacherId],
      references: [teachers.id],
    }),
    replacementClassroom: one(classrooms, {
      fields: [scheduleOverrides.replacementClassroomId],
      references: [classrooms.id],
    }),
  }),
);

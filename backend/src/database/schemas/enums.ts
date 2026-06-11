import { pgEnum } from "drizzle-orm/pg-core";

export const studyShiftEnum = pgEnum("study_shift", [
  "morning",
  "evening",
  "night",
]);

export const dayEnum = pgEnum("day", [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

export const academicLevel = pgEnum("academic_level", [
  "Associate",
  "Bachelor",
  "Master",
  "PhD",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
]);

export const gender = pgEnum("gender", ["male", "female"]);

export const educationalStatus = pgEnum("educational_status", [
  "enrolled",
  "suspended",
  "graduated",
  "dropped_out",
  "transferred",
]);

export const notificationPriority = pgEnum("notification_priority", [
  "low",
  "normal",
  "high",
]);

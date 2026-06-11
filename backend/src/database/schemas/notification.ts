import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { faculties, students, teachers } from "./academic";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  facultyId: integer("faculty_id")
    .references(() => faculties.id)
    .notNull(),
  targetDepartment: integer("target_department"),
  targetSkill: integer("target_skill"),
  targetGeneration: integer("target_generation"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationRecipients = pgTable("notification_recipients", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id")
    .references(() => notifications.id)
    .notNull(),
  studentId: integer("student_id")
    .references(() => students.id),
  teacherId: integer("teacher_id")
    .references(() => teachers.id),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

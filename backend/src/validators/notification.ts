import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  facultyId: z.number(),
  targetDepartment: z.number().optional(),
  targetSkill: z.number().optional(),
  targetGeneration: z.number().optional(),
  priority: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const markAsReadSchema = z.object({
  recipientId: z.number(),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;

export const deleteNotificationSchema = z.object({
  id: z.number(),
});

export type DeleteNotificationInput = z.infer<typeof deleteNotificationSchema>;

export const getNotificationSchema = z.object({
  id: z.number(),
});

export type GetNotificationInput = z.infer<typeof getNotificationSchema>;

export const getUnreadNotificationsSchema = z.object({
  studentId: z.string(),
});

export type GetUnreadNotificationsInput = z.infer<
  typeof getUnreadNotificationsSchema
>;

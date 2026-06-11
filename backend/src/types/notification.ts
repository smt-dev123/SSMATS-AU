import { notifications } from "@/database/schemas/notification";

export type Notification = typeof notifications.$inferSelect;
export type NotificationRecipient = {
  id: number;
  isRead: boolean | null;
  notification: {
    title: string;
    message: string;
    priority: string | null;
    createdAt: Date | null;
  };
};
export type MarkAsRead = {
  id: number;
  isRead: boolean | null;
};

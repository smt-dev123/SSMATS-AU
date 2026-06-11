import { type DrizzleDb } from "@/database";
import {
  notifications,
  notificationRecipients,
} from "@/database/schemas/notification";
import { eq, and } from "drizzle-orm";
import {
  type MarkAsRead,
  type Notification,
  type NotificationRecipient,
} from "@/types/notification";
import type { CreateNotificationInput } from "@/validators/notification";

export class NotificationRepository {
  constructor(private readonly db: DrizzleDb) {}

  async create(data: CreateNotificationInput): Promise<Notification> {
    const [notification] = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    if (!notification) {
      throw new Error("Insert did not return a record");
    }
    return notification;
  }

  async createRecipients(
    data: { notificationId: number; studentId?: number; teacherId?: number }[],
  ): Promise<void> {
    await this.db.insert(notificationRecipients).values(data);
  }

  async findAll(): Promise<Notification[]> {
    return this.db.query.notifications.findMany({
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }

  async findById(id: number): Promise<Notification | undefined> {
    return this.db.query.notifications.findFirst({
      where: eq(notifications.id, id),
    });
  }

  async findByStudent(
    studentId: number,
  ): Promise<NotificationRecipient[]> {
    return this.db.query.notificationRecipients.findMany({
      columns: {
        id: true,
        isRead: true,
      },
      where: eq(notificationRecipients.studentId, studentId),
      orderBy: (recipients, { desc }) => [desc(recipients.createdAt)],
      with: {
        notification: {
          columns: {
            title: true,
            message: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findByTeacher(
    teacherId: number,
  ): Promise<NotificationRecipient[]> {
    return this.db.query.notificationRecipients.findMany({
      columns: {
        id: true,
        isRead: true,
      },
      where: eq(notificationRecipients.teacherId, teacherId),
      orderBy: (recipients, { desc }) => [desc(recipients.createdAt)],
      with: {
        notification: {
          columns: {
            title: true,
            message: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async markAsRead(recipientId: number): Promise<MarkAsRead | undefined> {
    const [updated] = await this.db
      .update(notificationRecipients)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notificationRecipients.id, recipientId))
      .returning({
        id: notificationRecipients.id,
        isRead: notificationRecipients.isRead,
      });
    return updated;
  }

  async delete(id: number): Promise<Notification | undefined> {
    const [deleted] = await this.db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return deleted;
  }
}

import { NotificationRepository } from "@/repositories/notification.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { TeacherRepository } from "@/repositories/teacher.repository";
import { WebSocketManager } from "@/lib/ws-manager";
import { HTTPException } from "hono/http-exception";
import type {
  MarkAsRead,
  Notification,
  NotificationRecipient,
} from "@/types/notification";

export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly studentRepo: StudentRepository,
    private readonly teacherRepo: TeacherRepository,
    private readonly wsManager: WebSocketManager,
  ) { }

  async createBroadcast(data: {
    title: string;
    message: string;
    facultyId: number;
    targetDepartment?: number;
    targetSkill?: number;
    targetGeneration?: number;
    priority?: string;
  }): Promise<Notification> {
    // ១. បង្កើតទិន្នន័យ Notification ដើម
    const notification = await this.notificationRepo
      .create(data)
      .catch((error) => {
        console.error("[Notification] Failed to create:", error);
        throw new HTTPException(500, {
          message: "Failed to create notification",
        });
      });

    // ២. ទាញយកបញ្ជីសិស្សគោលដៅ
    const rawStudents = await this.studentRepo
      .findByFilter({
        facultyId: data.facultyId,
        departmentId: data.targetDepartment,
        skillId: data.targetSkill,
        generation: data.targetGeneration,
      })
      .catch((error) => {
        console.error("[Notification] Failed to fetch target students:", error);
        throw new HTTPException(500, {
          message: "Failed to fetch target students",
        });
      });

    // ៣. ទាញយកបញ្ជីគ្រូគោលដៅ (កែសម្រួលដើម្បីឱ្យត្រូវជាមួយ Pagination format { data, total, page, limit })
    const teacherQueryResult = await this.teacherRepo
      .findAll({
        facultyId: data.facultyId,
        page: 1,      // ចាប់ផ្ដើមពីទំព័រទី១
        limit: 100,   // កំណត់ចំនួនឱ្យច្រើនដើម្បីទាញយកមកឱ្យអស់គ្រូក្នុង Faculty នោះ
      })
      .catch((error) => {
        console.error("[Notification] Failed to fetch target teachers:", error);
        return null;
      });

    // 🛡️ ត្រួតពិនិត្យ និងបំប្លែងឱ្យទៅជា Array ពិតប្រាកដ (ទប់ស្កាត់លក្ខខណ្ឌ Null/Undefined/Object)
    const targetStudents = Array.isArray(rawStudents) ? rawStudents : [];
    const targetTeachers = teacherQueryResult && Array.isArray(teacherQueryResult.data)
      ? teacherQueryResult.data
      : [];

    // បោះ Log ឆែកមើលចំនួនទិន្នន័យនៅលើ Terminal Backend (ងាយស្រួល Debug)
    console.log(`[Notification Debug] រកឃើញសិស្សគោលដៅ៖ ${targetStudents.length} នាក់`);
    console.log(`[Notification Debug] រកឃើញគ្រូគោលដៅ៖ ${targetTeachers.length} នាក់`);

    // ប្រសិនបើគ្មានសិស្ស ឬគ្រូសោះ គឺផ្អាកត្រឹមនេះ
    if (targetStudents.length === 0 && targetTeachers.length === 0) return notification;

    const recipients: { notificationId: number; studentId?: number; teacherId?: number }[] = [];

    // រៀបចំទិន្នន័យសម្រាប់សិស្សចូលក្នុងតារាងអ្នកទទួល (Recipients)
    targetStudents.forEach((s) => {
      if (s && s.id) {
        recipients.push({ notificationId: notification.id, studentId: s.id });
      }
    });

    // រៀបចំទិន្នន័យសម្រាប់គ្រូចូលក្នុងតារាងអ្នកទទួល (Recipients)
    targetTeachers.forEach((t) => {
      // ករណី innerJoin ជាមួយ user, ទិន្នន័យគ្រូអាចនឹងស្ថិតនៅក្នុង Object ធំ ឬ nested object
      // កូដនេះជួយការពារទាំងពីរករណី (t.id ឬ t.teachers.id)
      const teacherId = t.id || (t.teachers && t.teachers.id);
      if (teacherId) {
        recipients.push({ notificationId: notification.id, teacherId: teacherId });
      }
    });

    // ៤. រក្សាទុកអ្នកទទួលទាំងអស់ចូលក្នុង Database
    if (recipients.length > 0) {
      await this.notificationRepo
        .createRecipients(recipients)
        .catch((error) => {
          console.error("[Notification] Failed to create recipients:", error);
          throw new HTTPException(500, {
            message: "Failed to create recipients",
          });
        });
    }

    // ៥. បាញ់ណូទីហ្វិកេសិនភ្លាមៗទៅកាន់ Mobile របស់សិស្សតាម WebSocket
    targetStudents.forEach((student) => {
      const userId = student.userId || (student as any).userId;
      if (userId) {
        this.wsManager.sendToUser(userId, {
          type: "NEW_NOTIFICATION",
          data: notification,
        });
      }
    });

    // ៦. បាញ់ណូទីហ្វិកេសិនភ្លាមៗទៅកាន់ Mobile របស់គ្រូតាម WebSocket
    targetTeachers.forEach((teacher) => {
      // ទាញយក userId របស់គ្រូ (គាំទ្រទាំងទម្រង់ select flat និង select join object)
      const userId = teacher.userId || (teacher.teachers && teacher.teachers.userId) || (teacher as any).userId;
      if (userId) {
        this.wsManager.sendToUser(userId, {
          type: "NEW_NOTIFICATION",
          data: notification,
        });
      }
    });

    return notification;
  }

  async findMyNotifications(userId: string): Promise<NotificationRecipient[]> {
    const student = await this.studentRepo.findByUserId(userId);
    if (student) {
      return this.notificationRepo.findByStudent(student.id);
    }

    const teacher = await this.teacherRepo.findByUserId(userId);
    if (teacher) {
      return this.notificationRepo.findByTeacher(teacher.id);
    }

    return [];
  }

  async markAsRead(recipientId: number): Promise<MarkAsRead> {
    const updated = await this.notificationRepo.markAsRead(recipientId);
    if (!updated) {
      throw new HTTPException(404, {
        message: "Notification recipient not found",
      });
    }
    return updated;
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepo.findAll();
  }

  async findById(id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) {
      throw new HTTPException(404, { message: "Notification not found" });
    }
    return notification;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.notificationRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Notification not found" });
    }
  }
}
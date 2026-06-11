import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  studentCreateSchema,
  studentPromoteSchema,
  studentQuerySchema,
  studentUpdateSchema,
} from "@/validators/academy";
import authentication from "@/middlewares/auth";
import { auth } from "@/lib/auth";
import requirePermission from "@/middlewares/permission";
import z from "zod";
import type { Variables } from "@/types/middleware";
import { upload } from "@/middlewares/upload";
import { deleteFile } from "@/utils/upload";

const router = new Hono<{ Variables: Variables }>();

router.get(
  "/",
  authentication,
  requirePermission("student", "read"),
  zValidator("query", studentQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const { studentService } = c.var.container;
    const students = await studentService.findAll(query);
    return c.json(students);
  },
);

router.get(
  "/profile/me",
  authentication,
  requirePermission("student", "read-own"),
  async (c) => {
    const user = c.get("user");
    const { studentService } = c.var.container;
    const student = await studentService.findByUserId(user.id);
    return c.json(student);
  },
);

router.put(
  "/profile/me",
  authentication,
  requirePermission("student", "update-own"),
  upload("image"),
  zValidator("form", studentUpdateSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("form");
    const image = c.get("upload");
    const { studentService, userService } = c.var.container;
    try {
      const student = await studentService.findByUserId(user.id);
      if (!student) {
        return c.json({ message: "Student not found" }, 404);
      }

      await userService.updateUser(user.id, {
        name: data.name,
        nameEn: data.nameEn,
        email: data.email,
        image: image?.url,
      });

      // Update Student specific info
      const { name, nameEn, email, ...studentData } = data;
      const updated = await studentService.update(
        student.id,
        studentData,
        image?.url,
        image?.filename,
      );
      return c.json(updated);
    } catch (error) {
      if (image?.filename) {
        await deleteFile(image.filename).catch(() => {});
      }
      throw error;
    }
  },
);

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { studentService } = c.var.container;
  const student = await studentService.findByUserId(id);
  return c.json(student);
});

router.post(
  "/",
  authentication,
  requirePermission("student", "create"),
  upload("image"),
  zValidator("form", studentCreateSchema),
  async (c) => {
    const data = c.req.valid("form");
    const image = c.get("upload");

    try {
      const { user } = await auth.api.createUser({
        body: {
          name: data.name,
          nameEn: data.nameEn,
          email: data.email,
          password: data.password,
          role: "student",
          image: image?.url,
        } as any,
      });
      const { studentService } = c.var.container;
      const { name, nameEn, email, password, ...studentData } = data;
      const student = await studentService.create({
        ...studentData,
        userId: user.id as string,
        image: image?.url,
      });
      return c.json(student);
    } catch (error) {
      if (image?.filename) {
        await deleteFile(image.filename).catch(() => {});
      }
      throw error;
    }
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("student", "update"),
  upload("image"),
  zValidator("form", studentUpdateSchema),
  async (c) => {
    const id = c.req.param("id") as unknown as number;
    const data = c.req.valid("form");
    const image = c.get("upload");
    const { studentService, userService } = c.var.container;
    try {
      const student = await studentService.findById(id);
      if (!student) {
        return c.json({ message: "Student not found" }, 404);
      }

      // Update User info
      await userService.updateUser((student as any).userId, {
        name: data.name,
        nameEn: data.nameEn,
        email: data.email,
        image: image?.url,
      });

      // Update Student specific info
      const { name, nameEn, email, ...studentData } = data;
      const updated = await studentService.update(
        id,
        studentData,
        image?.url,
        image?.filename,
      );
      return c.json(updated);
    } catch (error) {
      if (image?.filename) {
        await deleteFile(image.filename).catch(() => {});
      }
      throw error;
    }
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("student", "delete"),
  async (c) => {
    const id = c.req.param("id") as unknown as number;
    const { studentService, userService } = c.var.container;
    const student = await studentService.findById(id);
    if (!student) {
      return c.json({ message: "Student not found" }, 404);
    }

    // Deleting the user will cascade delete the student record
    await userService.deleteUser((student as any).userId);
    return c.json({ message: "Student and associated user deleted" });
  },
);

router.get(
  "/attendance/report",
  authentication,
  requirePermission("attendance", "read"),
  async (c) => {
    const user = c.get("user");
    const { studentService } = c.var.container;
    const records = await studentService.generateAttendanceReportForStudent(
      (user as any).id,
    );
    return c.json(records);
  },
);

router.get(
  "/schedule/current-academic-year",
  authentication,
  requirePermission("schedule", "read-own"),
  zValidator("query", z.object({ semester: z.coerce.number().optional() })),
  async (c) => {
    const user = c.get("user");
    const { semester = 1 } = c.req.valid("query");
    const { studentService } = c.var.container;
    const schedule =
      await studentService.findScheduleByStudentIdAndCurrentAcademicYear(
        user.id,
        semester,
      );
    return c.json(schedule);
  },
);

router.post(
  "/promote",
  authentication,
  requirePermission("student", "promote"),
  zValidator("json", studentPromoteSchema),
  async (c) => {
    const { studentService } = c.var.container;
    const data = c.req.valid("json");
    const student = await studentService.promote(data);
    return c.json(student);
  },
);

export default router;

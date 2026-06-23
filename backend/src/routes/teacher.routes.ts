import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  teacherIdParamSchema,
  teacherQuerySchema,
  teacherCreateSchema,
  teacherUpdateSchema,
} from "@/validators/academy";
import type { Variables } from "@/types/middleware";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";
import { auth } from "@/lib/auth";
import { upload } from "@/middlewares/upload";
import { deleteFile } from "@/utils/upload";

const router = new Hono<{ Variables: Variables }>();

router.use(authentication);

router.get(
  "/",
  authentication,
  requirePermission("teacher", "read"),
  zValidator("query", teacherQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const { teacherService } = c.var.container;
    const teachers = await teacherService.findAll(query);
    return c.json(teachers);
  },
);

router.get("/profile/me", async (c) => {
  const { teacherService } = c.var.container;
  const user = c.get("user");
  const teacher = await teacherService.findByUserId(user.id);
  return c.json(teacher);
});

router.put(
  "/profile/me",
  authentication,
  requirePermission("teacher", "update-own"),
  upload("image"),
  zValidator("form", teacherUpdateSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("form");
    const image = c.get("upload");
    const { teacherService, userService } = c.var.container;
    try {
      const teacher = await teacherService.findByUserId(user.id);
      if (!teacher) {
        return c.json({ message: "Teacher not found" }, 404);
      }

      // Update User info
      await userService.updateUser(user.id, {
        name: data.name,
        nameEn: data.nameEn,
        email: data.email,
        image: image?.url,
      });

      // Update Teacher specific info
      const { name, nameEn, email, ...teacherData } = data;
      const updated = await teacherService.update(
        teacher.id,
        teacherData,
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

router.post(
  "/",
  authentication,
  requirePermission("teacher", "create"),
  upload("image"),
  zValidator("form", teacherCreateSchema),
  async (c) => {
    const { teacherService, userService } = c.var.container;
    const data = c.req.valid("form");
    const image = c.get("upload");
    try {
      const { user } = await auth.api.createUser({
        body: {
          name: data.name,
          nameEn: data.nameEn,
          email: data.email,
          password: data.password,
          role: "teacher",
          image: image?.url,
        } as any,
      });

      if (data.nameEn) {
        await userService.updateUser(user.id as string, { nameEn: data.nameEn });
      }

      const { name, nameEn, email, password, ...teacherData } = data;
      const teacher = await teacherService.create({
        ...teacherData,
        userId: (user as any).id,
        image: image?.url,
      });
      return c.json(teacher);
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
  requirePermission("teacher", "update"),
  upload("image"),
  zValidator("param", teacherIdParamSchema),
  zValidator("form", teacherUpdateSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const data = c.req.valid("form");
    const image = c.get("upload");
    const { teacherService, userService } = c.var.container;
    try {
      const teacher = await teacherService.findById(id);
      if (!teacher) {
        return c.json({ message: "Teacher not found" }, 404);
      }

      // Update User info
      await userService.updateUser(teacher.userId, {
        name: data.name,
        nameEn: data.nameEn,
        email: data.email,
        image: image?.url,
      });

      // Update Teacher specific info
      const { name, nameEn, email, ...teacherData } = data;
      const updated = await teacherService.update(
        id,
        teacherData,
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
  requirePermission("teacher", "delete"),
  zValidator("param", teacherIdParamSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { teacherService, userService } = c.var.container;
    const teacher = await teacherService.findById(id);
    if (!teacher) {
      return c.json({ message: "Teacher not found" }, 404);
    }

    // Deleting the user will cascade delete the teacher record due to schema definition
    await userService.deleteUser(teacher.userId);
    return c.json({ message: "Teacher and associated user deleted" });
  },
);

export default router;

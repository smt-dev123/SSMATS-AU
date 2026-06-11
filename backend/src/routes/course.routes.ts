import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  courseSchema,
  courseUpdateSchema,
  courseQuerySchema,
} from "@/validators/academy";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const router = new Hono();

router.get(
  "/",
  authentication,
  requirePermission("course", "read"),
  zValidator("query", courseQuerySchema),
  async (c) => {
    const { courseService, teacherRepository, studentRepository } =
      c.var.container;
    const query = c.req.valid("query");
    const user = c.var.user;

    if (user.role === "teacher") {
      const teacher = await teacherRepository.findByUserId(user.id);
      if (teacher) {
        query.teacherId = teacher.id;
      }
    } else if (user.role === "student") {
      const student = await studentRepository.findByUserId(user.id);
      if (student) {
        query.studentId = student.id;
      }
    }

    const result = await courseService.findAll(query);
    return c.json(result);
  },
);

router.get(
  "/:id",
  authentication,
  requirePermission("course", "read"),
  async (c) => {
    const { courseService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const course = await courseService.findById(id);
    return c.json({ data: course });
  },
);

router.get(
  "/:id/students",
  authentication,
  requirePermission("course", "read"),
  async (c) => {
    const { courseService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const students = await courseService.getCourseStudents(id);
    return c.json({ data: students });
  },
);

router.post(
  "/",
  authentication,
  requirePermission("course", "create"),
  zValidator("json", courseSchema),
  async (c) => {
    const { courseService } = c.var.container;
    const data = c.req.valid("json");
    const course = await courseService.create(data);
    return c.json({ data: course });
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("course", "update"),
  zValidator("json", courseUpdateSchema),
  async (c) => {
    const { courseService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const data = c.req.valid("json");
    const course = await courseService.update(id, data);
    return c.json({ data: course });
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("course", "delete"),
  async (c) => {
    const { courseService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    await courseService.delete(id);
    return c.json({ message: "Course deleted successfully" });
  },
);

export default router;

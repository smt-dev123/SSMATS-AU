import { type Classroom } from "@/types/infrastructure";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  classroomQuerySchema,
  classroomSchema,
  classroomUpdateSchema,
} from "@/validators/infrastructure";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const router = new Hono();

router.get(
  "/",
  authentication,
  requirePermission("classroom", "read"),
  zValidator("query", classroomQuerySchema),
  async (c) => {
    const { classroomService } = c.var.container;
    const query = c.req.valid("query");
    const classrooms = await classroomService.findAll(query);
    return c.json(classrooms, 200);
  },
);

router.get(
  "/:id",
  authentication,
  requirePermission("classroom", "read"),
  async (c) => {
    const { classroomService } = c.var.container;
    const id = Number(c.req.param("id"));
    const classroom = await classroomService.findById(id);
    return c.json(classroom, 200);
  },
);

router.post(
  "/",
  authentication,
  requirePermission("classroom", "create"),
  zValidator("json", classroomSchema),
  async (c) => {
    const { classroomService } = c.var.container;
    const data = c.req.valid("json");
    const classroom = await classroomService.create(data);
    return c.json(classroom, 201);
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("classroom", "update"),
  zValidator("json", classroomUpdateSchema),
  async (c) => {
    const { classroomService } = c.var.container;
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const classroom = await classroomService.update(id, data);
    return c.json(classroom, 200);
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("classroom", "delete"),
  async (c) => {
    const { classroomService } = c.var.container;
    const id = Number(c.req.param("id"));
    await classroomService.delete(id);
    return c.json({ message: "Classroom deleted successfully" });
  },
);

export default router;

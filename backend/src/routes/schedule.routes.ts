import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  scheduleUpdateWithCoursesSchema,
  scheduleWithCoursesSchema,
  scheduleQuerySchema,
} from "@/validators/academy";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const router = new Hono();

router.get(
  "/",
  authentication,
  requirePermission("schedule", "read"),
  zValidator("query", scheduleQuerySchema),
  async (c) => {
    const { scheduleService } = c.var.container;
    const query = c.req.valid("query");
    const schedules = await scheduleService.findAll(query);
    return c.json(schedules);
  },
);

router.get(
  "/:id",
  authentication,
  requirePermission("schedule", "read"),
  async (c) => {
    const { scheduleService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const schedule = await scheduleService.findById(id);
    return c.json(schedule);
  },
);

router.post(
  "/",
  authentication,
  requirePermission("schedule", "create"),
  zValidator("json", scheduleWithCoursesSchema),
  async (c) => {
    const { scheduleService } = c.var.container;
    const data = c.req.valid("json");
    const result = await scheduleService.createSchedule(data);
    return c.json(result);
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("schedule", "update"),
  zValidator("json", scheduleUpdateWithCoursesSchema),
  async (c) => {
    const { scheduleService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const data = c.req.valid("json");
    const schedule = await scheduleService.updateSchedule(id, data);
    return c.json(schedule);
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("schedule", "delete"),
  async (c) => {
    const { scheduleService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const schedule = await scheduleService.deleteSchedule(id);
    return c.json(schedule);
  },
);

export default router;

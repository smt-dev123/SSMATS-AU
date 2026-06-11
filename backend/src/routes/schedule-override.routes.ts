import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  scheduleOverrideSchema,
  scheduleOverrideUpdateSchema,
  scheduleOverrideQuerySchema,
  scheduleOverrideIdParamSchema,
} from "@/validators/academy";
import { z } from "zod";
import type { ScheduleOverrideService } from "@/services/schedule-override.service";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const scheduleOverrideRoutes = new Hono();

scheduleOverrideRoutes.post(
  "/",
  authentication,
  requirePermission("schedule", "create"),
  zValidator("json", scheduleOverrideSchema),
  async (c) => {
    const data = c.req.valid("json");
    const { scheduleOverrideService: service } = c.get("container");
    const override = await service.createOverride(data);
    return c.json(override, 201);
  },
);

scheduleOverrideRoutes.get(
  "/",
  authentication,
  requirePermission("schedule", "read"),
  zValidator("query", scheduleOverrideQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const { scheduleOverrideService: service } = c.get("container");
    const overrides = await service.getOverrides(query.date);
    return c.json(overrides);
  },
);

scheduleOverrideRoutes.get(
  "/daily",
  authentication,
  requirePermission("schedule", "read"),
  zValidator(
    "query",
    z.object({
      date: z.string().optional(),
      facultyId: z.coerce.number().optional(),
    }),
  ),
  async (c) => {
    const date = c.req.query("date");
    const facultyId = c.req.query("facultyId")
      ? Number(c.req.query("facultyId"))
      : undefined;
    if (!date) return c.json({ message: "Date is required" }, 400);

    const { scheduleOverrideService: service } = c.get("container");
    const schedule = await service.getDailySchedule(date, facultyId);
    return c.json(schedule);
  },
);

scheduleOverrideRoutes.put(
  "/:id",
  authentication,
  requirePermission("schedule", "update"),
  zValidator("param", scheduleOverrideIdParamSchema),
  zValidator("json", scheduleOverrideUpdateSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const { scheduleOverrideService: service } = c.get("container");
    const override = await service.updateOverride(id, data);
    return c.json(override);
  },
);

scheduleOverrideRoutes.delete(
  "/:id",
  authentication,
  requirePermission("schedule", "delete"),
  zValidator("param", scheduleOverrideIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { scheduleOverrideService: service } = c.get("container");
    await service.deleteOverride(id);
    return c.json({ success: true });
  },
);

export default scheduleOverrideRoutes;

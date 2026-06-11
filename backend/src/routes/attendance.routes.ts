import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  bulkAttendanceSchema,
  attendanceReportQuerySchema,
} from "@/validators/attendance";
import { roleMiddleware } from "@/middlewares/roles";
import authentication from "@/middlewares/auth";
import type { Variables } from "@/types/middleware";
import requirePermission from "@/middlewares/permission";

const router = new Hono<{ Variables: Variables }>();

router.post(
  "/bulk",
  authentication,
  requirePermission("attendance", "create"),
  zValidator("json", bulkAttendanceSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");
    const { attendanceService } = c.get("container");
    const result = await attendanceService.markBulkAttendance(data, user as any);
    return c.json(result);
  },
);

router.get(
  "/student/:id",
  authentication,
  requirePermission("attendance", "read"),
  async (c) => {
    const id = c.req.param("id");
    const { attendanceService } = c.get("container");
    const records = await attendanceService.getAttendanceByStudentId(
      Number(id),
    );
    return c.json(records);
  },
);

router.get(
  "/course/:courseId",
  authentication,
  requirePermission("attendance", "read"),
  async (c) => {
    const courseId = Number(c.req.param("courseId"));
    const date = c.req.query("date");
    const sessionStr = c.req.query("session");

    if (!date) {
      return c.json({ message: "Date is required" }, 400);
    }

    const { attendanceService } = c.get("container");
    const records = await attendanceService.getAttendanceByCourseIdAndDate(
      courseId,
      date,
      sessionStr ? Number(sessionStr) : undefined
    );
    return c.json(records);
  },
);

router.get(
  "/report",
  authentication,
  requirePermission("attendance", "read"),
  zValidator("query", attendanceReportQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const { attendanceService } = c.get("container");
    const records = await attendanceService.attendanceReport(query);
    return c.json(records);
  },
);

export default router;

import { Hono } from "hono";
import { logger } from "hono/logger";
import { diMiddleware } from "./middlewares/di";
import buildingRoutes from "./routes/building.routes";
import classroomRoutes from "./routes/classroom.routes";
import academicLevelRoutes from "./routes/academic-level.routes";
import attendanceRoutes from "./routes/attendance.routes";
import departmentRoutes from "./routes/department.routes";
import facultyRoutes from "./routes/faculty.routes";
import scheduleRoutes from "./routes/schedule.routes";
import sessionTimeRoutes from "./routes/session-time.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import translationRoutes from "./routes/translation.routes";
import notificationRoutes from "./routes/notification.routes";
import academicYearRoutes from "./routes/academic-year.routes";
import uploadRoutes from "./routes/upload.routes";
import { auth } from "./lib/auth";
import { errorHandler } from "./middlewares/error";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { secureHeaders } from "hono/secure-headers";
import skillRoutes from "./routes/skill.routes";
import courseRoutes from "./routes/course.routes";
import scheduleOverrideRoutes from "./routes/schedule-override.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";

import maintenanceRoutes from "./routes/maintenance.routes";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", diMiddleware);
app.use(
  "*",
  secureHeaders({
    crossOriginResourcePolicy: "cross-origin",
  }),
);
app.use("*", serveStatic({ root: "./" }));
app.use(
  "*",
  cors({
    origin: [
      "http://localhost",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "http://38.47.33.228",
      "http://38.47.33.228:5173",
      "http://38.47.33.228:8081",
      "http://192.168.10.10",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

app.notFound((c) => c.json({ message: "Route not found" }, 404));

app.route("/api/buildings", buildingRoutes);
app.route("/api/classrooms", classroomRoutes);
app.route("/api/academic-levels", academicLevelRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/departments", departmentRoutes);
app.route("/api/faculties", facultyRoutes);
app.route("/api/schedules", scheduleRoutes);
app.route("/api/session-times", sessionTimeRoutes);
app.route("/api/students", studentRoutes);
app.route("/api/teachers", teacherRoutes);
app.route("/api/translations", translationRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/academic-years", academicYearRoutes);
app.route("/api/skills", skillRoutes);
app.route("/api/courses", courseRoutes);
app.route("/api/schedule-overrides", scheduleOverrideRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/upload", uploadRoutes);
app.route("/api/users", userRoutes);
app.route("/api/maintenance", maintenanceRoutes);

app.onError((e, c) => errorHandler(c, e));

export default app;

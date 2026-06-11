import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  academicYearSchema,
  academicYearUpdateSchema,
} from "@/validators/academy";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const router = new Hono();

router.get(
  "/",
  authentication,
  requirePermission("academicYear", "read"),
  async (c) => {
    const { academicYearService } = c.var.container;
    const academicYears = await academicYearService.findAll();
    return c.json(academicYears);
  },
);

router.get(
  "/:id",
  authentication,
  requirePermission("academicYear", "read"),
  async (c) => {
    const { academicYearService } = c.var.container;
    const academicYear = await academicYearService.findById(
      Number(c.req.param("id")),
    );
    return c.json(academicYear);
  },
);

router.post(
  "/",
  authentication,
  requirePermission("academicYear", "create"),
  zValidator("json", academicYearSchema),
  async (c) => {
    const { academicYearService } = c.var.container;
    const academicYear = await academicYearService.create(c.req.valid("json"));
    return c.json(academicYear);
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("academicYear", "update"),
  zValidator("json", academicYearUpdateSchema),
  async (c) => {
    const { academicYearService } = c.var.container;
    const academicYear = await academicYearService.update(
      Number(c.req.param("id")),
      c.req.valid("json"),
    );
    return c.json(academicYear);
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("academicYear", "delete"),
  async (c) => {
    const { academicYearService } = c.var.container;
    const academicYear = await academicYearService.delete(
      Number(c.req.param("id")),
    );
    return c.json(academicYear);
  },
);

export default router;

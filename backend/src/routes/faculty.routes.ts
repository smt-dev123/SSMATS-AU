import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { facultySchema, facultyUpdateSchema } from "@/validators/academy";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const router = new Hono();

router.get(
  "/",
  authentication,
  requirePermission("faculty", "read"),
  async (c) => {
    const { facultyService } = c.var.container;
    const faculties = await facultyService.findAll();
    return c.json(faculties);
  },
);

router.get(
  "/:id",
  authentication,
  requirePermission("faculty", "read"),
  async (c) => {
    const { facultyService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const faculty = await facultyService.findById(id);
    return c.json(faculty);
  },
);

router.post(
  "/",
  authentication,
  requirePermission("faculty", "create"),
  zValidator("json", facultySchema),
  async (c) => {
    const { facultyService } = c.var.container;
    const data = c.req.valid("json");
    const faculty = await facultyService.create(data);
    return c.json(faculty);
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("faculty", "update"),
  zValidator("json", facultyUpdateSchema),
  async (c) => {
    const { facultyService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const data = c.req.valid("json");
    const faculty = await facultyService.update(id, data);
    return c.json(faculty);
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("faculty", "delete"),
  async (c) => {
    const { facultyService } = c.var.container;
    const id = parseInt(c.req.param("id"));
    const faculty = await facultyService.delete(id);
    return c.json(faculty);
  },
);

export default router;

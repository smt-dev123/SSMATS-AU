import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";
import type { Variables } from "@/types/middleware";
import {
  skillCreateSchema,
  skillIdParamSchema,
  skillQuerySchema,
  skillUpdateSchema,
} from "@/validators/academy";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const router = new Hono<{ Variables: Variables }>();

router.use("/*", authentication);

router.post(
  "/",
  authentication,
  requirePermission("skill", "create"),
  zValidator("json", skillCreateSchema),
  async (c) => {
    const { skillService } = c.get("container");
    const body = c.req.valid("json");
    const result = await skillService.create(body);
    return c.json(result);
  },
);

router.put(
  "/:id",
  authentication,
  requirePermission("skill", "update"),
  zValidator("param", skillIdParamSchema),
  zValidator("json", skillUpdateSchema),
  async (c) => {
    const { skillService } = c.get("container");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await skillService.update(id, body);
    return c.json(result);
  },
);

router.delete(
  "/:id",
  authentication,
  requirePermission("skill", "delete"),
  zValidator("param", skillIdParamSchema),
  async (c) => {
    const { skillService } = c.get("container");
    const { id } = c.req.valid("param");
    const result = await skillService.delete(id);
    return c.json(result);
  },
);

router.get(
  "/:id",
  authentication,
  requirePermission("skill", "read"),
  zValidator("param", skillIdParamSchema),
  async (c) => {
    const { skillService } = c.get("container");
    const { id } = c.req.valid("param");
    const result = await skillService.findById(id);
    return c.json(result);
  },
);

router.get(
  "/",
  authentication,
  requirePermission("skill", "read"),
  zValidator("query", skillQuerySchema),
  async (c) => {
    const { skillService } = c.get("container");
    const query = c.req.valid("query");
    const result = await skillService.findAll(query);
    return c.json(result);
  },
);
export default router;

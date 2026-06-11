import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from "@/validators/user";
import type { Variables } from "@/types/middleware";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";

const userRoutes = new Hono<{ Variables: Variables }>();

userRoutes.get(
  "/",
  authentication,
  requirePermission("user", "read"),
  zValidator("query", userQuerySchema),
  async (c) => {
    const { userService } = c.var.container;
    const query = c.req.valid("query");
    const result = await userService.getUsers(query);
    return c.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  },
);

userRoutes.get(
  "/:id",
  authentication,
  requirePermission("user", "read"),
  async (c) => {
    const { userService } = c.var.container;
    const id = c.req.param("id");
    const user = await userService.getUserById(id);
    if (!user)
      return c.json({ success: false, message: "User not found" }, 404);
    return c.json({ success: true, data: user });
  },
);

userRoutes.post(
  "/",
  authentication,
  requirePermission("user", "create"),
  zValidator("json", createUserSchema),
  async (c) => {
    const { userService } = c.var.container;
    const data = c.req.valid("json");
    const result = await userService.createUser(data);
    return c.json({ success: true, data: result }, 201);
  },
);

userRoutes.put(
  "/:id",
  authentication,
  requirePermission("user", "update"),
  zValidator("json", updateUserSchema),
  async (c) => {
    const { userService } = c.var.container;
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const result = await userService.updateUser(id, data);
    return c.json({ success: true, data: result });
  },
);

userRoutes.delete(
  "/:id",
  authentication,
  requirePermission("user", "delete"),
  async (c) => {
    const { userService } = c.var.container;
    const id = c.req.param("id");
    const result = await userService.deleteUser(id);
    return c.json({ success: true, data: result });
  },
);

export default userRoutes;

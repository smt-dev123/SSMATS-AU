import type { Context, Next } from "hono";

export const roleMiddleware = (...roles: string[]) => {
  return (c: Context, next: Next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json(
        { message: "You are not authorized to access this resource" },
        401,
      );
    }
    return next();
  };
};

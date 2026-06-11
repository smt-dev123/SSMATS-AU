import { auth } from "@/lib/auth";
import { type PermissionStatement } from "@/lib/permission";
import type { Context, Next } from "hono";

type Role = "staff" | "teacher" | "student" | "manager";
type Resource = keyof PermissionStatement;
type Action<K extends Resource> = PermissionStatement[K][number];

const requirePermission = <K extends Resource>(
  resource: K,
  action: Action<K>,
) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Read the actual role from the authenticated user
    const role = user.role as Role;

    if (!role) {
      return c.json({ message: "Forbidden" }, 403);
    }

    try {
      const data = await auth.api.userHasPermission({
        body: {
          userId: user.id,
          role, // ✅ Now uses the real user's role
          permissions: {
            [resource]: [action],
          },
        },
      });

      if (!data.success) {
        return c.json({ message: "Forbidden" }, 403);
      }

      await next();
    } catch (error) {
      console.error("[requirePermission] Permission check failed:", error);
      return c.json({ message: "Permission check failed" }, 500);
    }
  };
};

export default requirePermission;

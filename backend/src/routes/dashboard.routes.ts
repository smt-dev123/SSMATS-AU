import { Hono } from "hono";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";
import type { Variables } from "@/types/middleware";

const router = new Hono<{ Variables: Variables }>();

router.get(
  "/summary",
  authentication,
  requirePermission("dashboard", "read"),
  async (c) => {
    const { dashboardService } = c.var.container;
    const summary = await dashboardService.getDashboardSummary();
    return c.json(summary);
  },
);

router.get("/summary-me", authentication, async (c) => {
  const user = c.get("user");
  const { dashboardService } = c.var.container;
  const summary = await dashboardService.getDashboardSummaryMe(
    user.id,
    user.role ?? "",
  );
  return c.json(summary);
});


export default router;

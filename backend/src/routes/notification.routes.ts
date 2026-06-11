import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { Variables } from "@/types/middleware";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";
import { createNotificationSchema } from "@/validators/notification";

const router = new Hono<{ Variables: Variables }>();

router.get("/", async (c) => {
  const { notificationService } = c.var.container;
  const notifications = await notificationService.findAll();
  return c.json(notifications);
});

router.post(
  "/broadcast",
  authentication,
  requirePermission("notification", "create"),
  zValidator("json", createNotificationSchema),
  async (c) => {
    const { notificationService } = c.var.container;
    const data = c.req.valid("json");
    const notification = await notificationService.createBroadcast(data);
    return c.json(notification, 201);
  },
);

router.get(
  "/my-notifications",
  authentication,
  requirePermission("notification", "read-own"),
  async (c) => {
    const { notificationService } = c.var.container;
    const { id } = c.get("user");
    const notifications = await notificationService.findMyNotifications(id);
    return c.json(notifications);
  },
);

router.patch(
  "/read/:id",
  authentication,
  requirePermission("notification", "read-own"),
  async (c) => {
    const { notificationService } = c.var.container;
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid notification ID" });
    }
    const result = await notificationService.markAsRead(id);
    return c.json(result);
  },
);

router.get(
  "/ws",
  authentication,
  (c, next) => {
    const user = c.get("user");
    if (!user) throw new HTTPException(401, { message: "Unauthorized" });
    return next();
  },
  upgradeWebSocket((c) => {
    const { wsManager } = c.var.container;
    const user = c.get("user");

    if (!user) {
      console.warn(`[WS] ${c.req.path} — Unauthorized`);
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const userId = user.id;

    return {
      onOpen(_event, ws) {
        wsManager.addClient(userId, ws);
        console.log(`WebSocket opened for user: ${userId}`);
      },
      async onMessage(event, ws) {
        const { notificationService } = c.var.container;
        try {
          const payload = JSON.parse(event.data as string);

          if (payload.type === "NEW_NOTIFICATION" && user.role === "staff") {
            const data = createNotificationSchema.parse(payload.data);
            const notification =
              await notificationService.createBroadcast(data);
            ws.send(
              JSON.stringify({
                type: "NOTIFICATION_CREATED",
                data: notification,
              }),
            );
          } else if (payload.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
          } else {
            console.warn(
              `[WS] Unhandled message type from ${userId}:`,
              payload.type,
            );
          }
        } catch (error) {
          console.error(`[WS] Error processing message from ${userId}:`, error);
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message:
                error instanceof Error
                  ? error.message
                  : "Invalid message format",
            }),
          );
        }
      },
      onClose(_event, ws) {
        wsManager.removeClient(userId, ws);
        console.log(`WebSocket closed for user: ${userId}`);
      },
    };
  }),
);

export default router;

import { Hono } from "hono";
import { upload } from "@/middlewares/upload";
import type { Variables } from "@/types/middleware";

const app = new Hono<{ Variables: Variables }>();

app.post("/", upload("file"), (c) => {
  const uploadResult = c.get("upload");
  if (!uploadResult) {
    return c.json({ success: false, message: "No file uploaded" }, 400);
  }
  return c.json({ success: true, data: uploadResult });
});

export default app;

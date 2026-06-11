import { createMiddleware } from "hono/factory";
import { uploadFile } from "@/utils/upload";
import { HTTPException } from "hono/http-exception";
import type { Variables } from "@/types/middleware";

export const upload = (fieldName: string) =>
  createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const body = (await c.req.parseBody({ all: true })) as Record<
      string,
      unknown
    >;
    const file = body[fieldName];

    if (file instanceof File) {
      try {
        c.set("upload", await uploadFile(file));
      } catch (error) {
        throw new HTTPException(400, { message: (error as Error).message });
      }
    }

    await next();
  });

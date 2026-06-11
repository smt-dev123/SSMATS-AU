import { createMiddleware } from "hono/factory";
import { container, type ICradle } from "@/lib/container";

declare module "hono" {
  interface ContextVariableMap {
    container: ICradle;
    session: any;
    user: any;
  }
}

export const diMiddleware = createMiddleware(async (c, next) => {
  c.set("container", container);
  await next();
});

import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

const authentication = createMiddleware(async (c, next) => {
  let session = await auth.api.getSession(c.req.raw);

  if (!session) {
    const queryToken = c.req.query("token");
    if (queryToken) {
      const headers = new Headers(c.req.raw.headers);
      headers.set("Authorization", `Bearer ${queryToken}`);
      headers.delete("Connection");
      headers.delete("Upgrade");
      const mockRequest = new Request(c.req.raw.url, {
        headers,
      });
      session = await auth.api.getSession(mockRequest);
    }
  }

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

export default authentication;

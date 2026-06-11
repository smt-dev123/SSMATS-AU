import { serve } from "bun";
import app from "./app";
import { websocket as bunWebsocket } from "hono/bun";

const server = serve({
  port: 3000,
  fetch: app.fetch,
  websocket: bunWebsocket,
});

console.log(`Server running at http://${server.hostname}:${server.port}`);

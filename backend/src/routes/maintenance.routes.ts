import { Hono } from "hono";
import { spawn } from "child_process";
import authentication from "@/middlewares/auth";
import requirePermission from "@/middlewares/permission";
import type { Variables } from "@/types/middleware";

const router = new Hono<{ Variables: Variables }>();

router.get(
  "/backup",
  authentication,
  requirePermission("system", "manage"),
  async (c) => {
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${date}.sql`;

    // Using pg_dump with --clean and --if-exists for better restore reliability
    const pgDump = spawn("docker", [
      "exec",
      "postgres",
      "pg_dump",
      "-U",
      "postgres",
      "--clean",
      "--if-exists",
      "--no-owner",
      "--no-privileges",
      "ssamss",
    ]);

    c.header("Content-Type", "application/sql");
    c.header("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream the output of pg_dump to the response
    return c.body(pgDump.stdout as any);
  },
);

router.post(
  "/restore",
  authentication,
  requirePermission("system", "manage"),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (!file) {
      return c.json({ message: "No file uploaded" }, 400);
    }

    // Using psql to restore from standard input
    // First, we drop and recreate the public schema to ensure a clean slate
    // This solves the issue where existing data conflicts with the restore
    try {
      await new Promise<void>((resolve, reject) => {
        const drop = spawn("docker", [
          "exec",
          "postgres",
          "psql",
          "-U",
          "postgres",
          "-d",
          "ssamss",
          "-c",
          "DROP SCHEMA public CASCADE; CREATE SCHEMA public;",
        ]);
        drop.on("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error("Failed to drop schema"));
        });
      });
    } catch (error: any) {
      return c.json(
        { message: "Failed to prepare database: " + error.message },
        500,
      );
    }

    const psql = spawn("docker", [
      "exec",
      "-i",
      "postgres",
      "psql",
      "-U",
      "postgres",
      "-d",
      "ssamss",
      "-v",
      "ON_ERROR_STOP=1",
    ]);

    let stderr = "";
    psql.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const reader = file.stream().getReader();

    // Process the file stream and write to psql stdin
    const streamToStdin = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        psql.stdin.write(value);
      }
      psql.stdin.end();
    };

    // Wait for the stream to finish and psql to exit
    try {
      await streamToStdin();

      const response = await new Promise<Response>((resolve) => {
        psql.on("exit", (code) => {
          if (code === 0) {
            resolve(c.json({ message: "Restore successful" }));
          } else {
            console.error("Restore failed:", stderr);
            resolve(
              c.json(
                {
                  message: "Restore failed",
                  error: stderr.split("\n").filter(Boolean).pop(),
                },
                500,
              ),
            );
          }
        });
        psql.on("error", (err) => {
          resolve(c.json({ message: "Restore error: " + err.message }, 500));
        });
      });
      return response;
    } catch (error: any) {
      return c.json({ message: "Error during restore: " + error.message }, 500);
    }
  },
);

export default router;

import { env } from "@/config/environment";
import type { Config } from "drizzle-kit";

export default {
  out: "./src/database/migrations",
  schema: "./src/database/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: env?.DATABASE_URL!,
  },
} satisfies Config;

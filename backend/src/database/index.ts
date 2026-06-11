import { env } from "@/config/environment";
import * as schema from "./schemas";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: env?.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export type DrizzleDb = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

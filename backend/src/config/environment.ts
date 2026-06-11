import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  WS_PORT: z.coerce.number().default(8080),
  BETTER_AUTH_URL: z.string(),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.log("Invalid environment variable");
}

export const env = parsed.data;

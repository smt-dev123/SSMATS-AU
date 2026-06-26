import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database";
import { twoFactor, bearer } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { ac, admin, manager, staff, student, teacher } from "./permission";
import redis from "@/config/redis";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  trustedOrigins: [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://162.220.11.16",
    "http://162.220.11.16:5173",
    "http://162.220.11.16:8081",
    "http://192.168.10.10",
  ],
  trustHost: true,
  rateLimit: {
    windowMs: 60 * 1000,
    max: 60,
    storage: "secondary-storage",
  },
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, JSON.stringify(value), "PX", ttl);
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  email: {
    enabled: true,
  },
  user: {
    additionalFields: {
      nameEn: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    twoFactor(),
    adminPlugin({
      ac,
      roles: {
        admin,
        staff,
        student,
        teacher,
        manager,
      },
    }),
    bearer(),
  ],
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database";
import { twoFactor, bearer } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { ac, admin, manager, staff, student, teacher } from "./permission";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  trustedOrigins: ["http://localhost:5173", "http://localhost:8081"],
  rateLimit: {
    windowMs: 60 * 1000,
    max: 10,
    storage: "database",
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

import { auth } from "@/lib/auth";
import { db } from "@/database";
import { user as userTable } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { env } from "@/config/environment";

async function seedAdmin() {
  console.log("🌱 Seeding admin user...");

  if (!env) {
    console.error(
      "❌ Environment configuration not found. Please check your .env file.",
    );
    process.exit(1);
  }

  try {
    const existingAdmin = await db.query.user.findFirst({
      where: eq(userTable.email, env.ADMIN_EMAIL),
    });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists. Ensuring role is 'admin'...");
      await db
        .update(userTable)
        .set({ role: "admin" })
        .where(eq(userTable.id, existingAdmin.id));
      console.log("✅ Admin role verified.");
      process.exit(0);
    }

    console.log(`  - Creating admin: ${env.ADMIN_NAME} (${env.ADMIN_EMAIL})`);

    // Better Auth's createUser will handle password hashing
    await auth.api.createUser({
      body: {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        name: env.ADMIN_NAME,
        role: "admin",
      },
    });

    console.log("✅ Admin user created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
    process.exit(1);
  }
}

seedAdmin();

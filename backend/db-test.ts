import { db } from "./src/database";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE notification_recipients ALTER COLUMN student_id DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE notification_recipients ADD COLUMN teacher_id INTEGER REFERENCES teachers(id);`);
    console.log("Migration complete");
  } catch(e) {
    console.error("Migration failed:", e);
  }
  process.exit(0);
}

main();

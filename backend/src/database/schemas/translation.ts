import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const translations = pgTable(
  "translation",
  {
    id: serial("id").primaryKey(),
    namespace: text("namespace").notNull(),
    language: text("language").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("unique_namespace_language_key").on(
      table.namespace,
      table.language,
      table.key,
    ),
  ],
);

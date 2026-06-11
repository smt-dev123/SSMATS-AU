import { translations } from "@/database/schemas";

export type Translation = typeof translations.$inferSelect;

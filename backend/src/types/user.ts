import { user } from "@/database/schemas";

export type User = typeof user.$inferSelect;
export type CreateUser = Omit<typeof user.$inferInsert, "id"> & { id?: string; password?: string };
export type UpdateUser = Partial<CreateUser>;

export type UserQueryInput = {
  page: number;
  limit: number;
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "staff" | "student" | "teacher" | "all";
};

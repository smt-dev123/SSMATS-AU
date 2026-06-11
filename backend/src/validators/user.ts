import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameEn: z.string().min(1, "English name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "staff", "student", "teacher"]),
  image: z.string().optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(["admin", "manager", "staff", "student", "teacher", "all"]).optional(),
});

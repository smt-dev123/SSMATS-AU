import z from "zod";

const zBoolean = z.preprocess((v) => {
  if (typeof v === "string") {
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return v;
}, z.boolean());


/**
 * Building Schemas
 */

export const buildingSchema = z.object({
  name: z.string().min(3).max(99),
  isActive: zBoolean.optional(),
});
export const buildingUpdateSchema = buildingSchema.partial();
export const buildingQuerySchema = z.object({
  name: z.string().optional(),
  isActive: zBoolean.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type BuildingInput = z.infer<typeof buildingSchema>;
export type BuildingUpdateInput = z.infer<typeof buildingUpdateSchema>;
export type BuildingQueryInput = z.infer<typeof buildingQuerySchema>;

/**
 * Classroom Schemas
 */
export const classroomSchema = z.object({
  classroomNumber: z.number().int().positive(),
  name: z.string().min(3).max(99),
  buildingId: z.number().int().positive(),
  floor: z.number().int().nonnegative(),
  isAvailable: zBoolean.optional(),
});
export const classroomUpdateSchema = classroomSchema.partial();
export const classroomQuerySchema = z.object({
  name: z.string().optional(),
  floor: z.coerce.number().int().nonnegative().optional(),
  isAvailable: zBoolean.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ClassroomInput = z.infer<typeof classroomSchema>;
export type ClassroomUpdateInput = z.infer<typeof classroomUpdateSchema>;
export type ClassroomQueryInput = z.infer<typeof classroomQuerySchema>;

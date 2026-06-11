import { buildings, classrooms } from "@/database/schemas";

/* Building */
export type Building = Pick<
  typeof buildings.$inferSelect,
  "id" | "name" | "isActive"
>;

/* Classroom */
export type Classroom = typeof classrooms.$inferSelect;

export type ClassroomWithBuilding = Pick<
  Classroom,
  "id" | "classroomNumber" | "name" | "floor" | "isAvailable"
> & {
  building: Pick<Building, "id" | "name">;
};

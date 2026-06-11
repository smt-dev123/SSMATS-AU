import { type DrizzleDb } from "@/database";
import { faculties } from "@/database/schemas";
import type { Faculty } from "@/types/academy";
import type { FacultyInput, FacultyUpdateInput } from "@/validators/academy";
import { eq } from "drizzle-orm";

export class FacultyRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findOne(id: number): Promise<Faculty | undefined> {
    return this.db.query.faculties
      .findFirst({
        where: eq(faculties.id, id),
      })
      .then((result) => result || undefined);
  }

  async findAll(): Promise<Faculty[]> {
    return this.db.select().from(faculties);
  }

  async create(data: FacultyInput): Promise<Faculty | undefined> {
    const [created] = await this.db
      .insert(faculties)
      .values({
        name: data.name,
      })
      .returning();
    return created || undefined;
  }

  async update(
    id: number,
    data: FacultyUpdateInput,
  ): Promise<Faculty | undefined> {
    const [updated] = await this.db
      .update(faculties)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(faculties.id, id))
      .returning();
    return updated || undefined;
  }

  async delete(id: number): Promise<Faculty | undefined> {
    const [deleted] = await this.db
      .delete(faculties)
      .where(eq(faculties.id, id))
      .returning();
    return deleted || undefined;
  }
}

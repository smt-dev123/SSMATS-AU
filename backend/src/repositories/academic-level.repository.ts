import { type DrizzleDb } from "@/database";
import { academicLevels, user } from "@/database/schemas";
import type { AcademicLevel } from "@/types/academy";
import type {
  AcademicLevelInput,
  AcademicLevelUpdateInput,
} from "@/validators/academy";
import { eq } from "drizzle-orm";

export class AcademicLevelRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll(): Promise<AcademicLevel[]> {
    return await this.db.query.academicLevels.findMany();
  }

  async findById(id: number): Promise<AcademicLevel | undefined> {
    return await this.db.query.academicLevels.findFirst({
      where: eq(academicLevels.id, id),
    });
  }

  async create(data: AcademicLevelInput): Promise<AcademicLevel> {
    const [newAcademicLevel] = await this.db
      .insert(academicLevels)
      .values(data)
      .returning();
    return newAcademicLevel!;
  }

  async update(
    id: number,
    data: AcademicLevelUpdateInput,
  ): Promise<AcademicLevel | undefined> {
    const [updated] = await this.db
      .update(academicLevels)
      .set(data)
      .where(eq(academicLevels.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<AcademicLevel> {
    const [deleted] = await this.db
      .delete(academicLevels)
      .where(eq(academicLevels.id, id))
      .returning();
    return deleted!;
  }
}

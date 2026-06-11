import type { DrizzleDb, Transaction } from "@/database";
import { academicYears, schedules } from "@/database/schemas";
import type { AcademicYear } from "@/types/academy";
import type {
  AcademicYearInput,
  AcademicYearUpdateInput,
} from "@/validators/academy";
import { eq } from "drizzle-orm";

export class AcademicYearRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll() {
    return await this.db.query.academicYears.findMany();
  }

  async findById(id: number) {
    return await this.db.query.academicYears.findFirst({
      where: eq(academicYears.id, id),
    });
  }

  async create(
    data: AcademicYearInput,
    tx?: Transaction,
  ): Promise<AcademicYear> {
    const db = tx || this.db;
    const [academicYear] = await db
      .insert(academicYears)
      .values(data)
      .returning();
    return academicYear!;
  }

  async update(
    id: number,
    data: AcademicYearUpdateInput,
    tx?: Transaction,
  ): Promise<AcademicYear> {
    const db = tx || this.db;
    const [updated] = await db
      .update(academicYears)
      .set(data)
      .where(eq(academicYears.id, id))
      .returning();
    return updated!;
  }

  async clearCurrent(tx?: Transaction): Promise<void> {
    const db = tx || this.db;
    await db.update(academicYears).set({ isCurrent: false });
  }

  async delete(id: number): Promise<AcademicYear> {
    const [deleted] = await this.db
      .delete(academicYears)
      .where(eq(academicYears.id, id))
      .returning();
    return deleted!;
  }
}

import { type DrizzleDb } from "@/database";
import { departments } from "@/database/schemas";
import type { Department } from "@/types/academy";
import type {
  DepartmentInput,
  DepartmentUpdateInput,
} from "@/validators/academy";
import { eq } from "drizzle-orm";

export class DepartmentRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll(): Promise<Department[]> {
    return await this.db.query.departments.findMany({
      with: {
        faculty: true,
      },
    });
  }

  async findById(id: number): Promise<Department | undefined> {
    return await this.db.query.departments.findFirst({
      where: eq(departments.id, id),
    });
  }

  async create(data: DepartmentInput): Promise<Department> {
    const [newDepartment] = await this.db
      .insert(departments)
      .values(data)
      .returning();
    return newDepartment!;
  }

  async update(
    id: number,
    data: DepartmentUpdateInput,
  ): Promise<Department | undefined> {
    const [updated] = await this.db
      .update(departments)
      .set(data)
      .where(eq(departments.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<Department> {
    const [deleted] = await this.db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();
    return deleted!;
  }
}

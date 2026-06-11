import type { AcademicYearRepository } from "@/repositories/academic-year.repository";
import type { AcademicYear } from "@/types/academy";
import type {
  AcademicYearInput,
  AcademicYearUpdateInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";
import type { DrizzleDb } from "@/database";

export class AcademicYearService {
  constructor(
    private readonly db: DrizzleDb,
    private readonly academicYearRepo: AcademicYearRepository,
  ) {}

  async create(data: AcademicYearInput): Promise<AcademicYear> {
    try {
      if (data.isCurrent) {
        return await this.db.transaction(async (tx) => {
          await this.academicYearRepo.clearCurrent(tx);
          return await this.academicYearRepo.create(data, tx);
        });
      }
      return this.academicYearRepo.create(data);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Academic year "${data.name}" already exists`,
        });
      }
      throw new HTTPException(500, {
        message: "Failed to create academic year",
      });
    }
  }

  async update(
    id: number,
    data: AcademicYearUpdateInput,
  ): Promise<AcademicYear> {
    if (Object.keys(data).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }

    let updated: AcademicYear | undefined;
    try {
      if (data.isCurrent) {
        updated = await this.db.transaction(async (tx) => {
          await this.academicYearRepo.clearCurrent(tx);
          return await this.academicYearRepo.update(id, data, tx);
        });
      } else {
        updated = await this.academicYearRepo.update(id, data);
      }
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Academic year "${data.name}" already exists`,
        });
      }
      throw new HTTPException(500, {
        message: "Failed to update academic year",
      });
    }

    if (!updated) {
      throw new HTTPException(404, { message: "Academic year not found" });
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.academicYearRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Academic year not found" });
    }
  }

  async findById(id: number): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepo.findById(id);
    if (!academicYear) {
      throw new HTTPException(404, { message: "Academic year not found" });
    }
    return academicYear;
  }

  async findAll(): Promise<AcademicYear[]> {
    return this.academicYearRepo.findAll();
  }
}

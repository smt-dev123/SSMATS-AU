import type { AcademicLevelRepository } from "@/repositories/academic-level.repository";
import type { AcademicLevel } from "@/types/academy";
import type {
  AcademicLevelInput,
  AcademicLevelUpdateInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

export class AcademicLevelService {
  constructor(private readonly academicLevelRepo: AcademicLevelRepository) {}

  async create(data: AcademicLevelInput): Promise<AcademicLevel> {
    try {
      return this.academicLevelRepo.create(data);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Academic level "${data.level}" already exists`,
        });
      }
      throw new HTTPException(500, {
        message: "Failed to create academic level",
      });
    }
  }

  async update(
    id: number,
    data: AcademicLevelUpdateInput,
  ): Promise<AcademicLevel> {
    if (Object.keys(data).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }

    let updated: AcademicLevel | undefined;
    try {
      updated = await this.academicLevelRepo.update(id, data);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Academic level "${data.level}" already exists`,
        });
      }
      throw new HTTPException(500, {
        message: "Failed to update academic level",
      });
    }

    if (!updated) {
      throw new HTTPException(404, { message: "Academic level not found" });
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.academicLevelRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Academic level not found" });
    }
  }

  async findById(id: number): Promise<AcademicLevel> {
    const academicLevel = await this.academicLevelRepo.findById(id);
    if (!academicLevel) {
      throw new HTTPException(404, { message: "Academic level not found" });
    }
    return academicLevel;
  }

  async findAll(): Promise<AcademicLevel[]> {
    return this.academicLevelRepo.findAll();
  }
}

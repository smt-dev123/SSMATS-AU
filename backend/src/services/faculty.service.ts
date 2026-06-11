import { FacultyRepository } from "@/repositories/faculty.repository";
import type { Faculty } from "@/types/academy";
import type { FacultyInput, FacultyUpdateInput } from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

export class FacultyService {
  constructor(private readonly facultyRepo: FacultyRepository) {}

  async findAll() {
    return this.facultyRepo.findAll();
  }

  async findById(id: number) {
    const faculty = await this.facultyRepo.findOne(id);
    if (!faculty) {
      throw new HTTPException(404, { message: "Faculty not found" });
    }
    return faculty;
  }

  async create(facultyData: FacultyInput) {
    try {
      return this.facultyRepo.create(facultyData);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Faculty "${facultyData.name}" already exists`,
        });
      }
      throw new HTTPException(500, { message: "Failed to create faculty" });
    }
  }

  async update(id: number, facultyData: FacultyUpdateInput) {
    if (Object.keys(facultyData).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }

    let updated: Faculty | undefined;
    try {
      updated = await this.facultyRepo.update(id, facultyData);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Faculty "${facultyData.name}" already exists`,
        });
      }
      throw new HTTPException(500, { message: "Failed to update faculty" });
    }

    if (!updated) {
      throw new HTTPException(404, { message: "Faculty not found" });
    }
    return updated;
  }

  async delete(id: number) {
    const deleted = await this.facultyRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Faculty not found" });
    }
    return deleted;
  }
}

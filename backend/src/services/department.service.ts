import { DepartmentRepository } from "@/repositories/department.repository";
import type { Department } from "@/types/academy";
import type {
  DepartmentInput,
  DepartmentUpdateInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

export class DepartmentService {
  constructor(private readonly departmentRepo: DepartmentRepository) {}

  async create(data: DepartmentInput): Promise<Department> {
    try {
      return this.departmentRepo.create(data);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Department "${data.name}" already exists`,
        });
      }
      throw new HTTPException(500, { message: "Failed to create department" });
    }
  }

  async update(id: number, data: DepartmentUpdateInput): Promise<Department> {
    if (Object.keys(data).length === 0) {
      throw new HTTPException(400, {
        message: "Update requires at least one field",
      });
    }

    let updated: Department | undefined;
    try {
      updated = await this.departmentRepo.update(id, data);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new HTTPException(409, {
          message: `Department "${data.name}" already exists`,
        });
      }
      throw new HTTPException(500, { message: "Failed to update department" });
    }

    if (!updated) {
      throw new HTTPException(404, { message: "Department not found" });
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.departmentRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Department not found" });
    }
  }

  async findById(id: number): Promise<Department> {
    const department = await this.departmentRepo.findById(id);
    if (!department) {
      throw new HTTPException(404, { message: "Department not found" });
    }
    return department;
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepo.findAll();
  }
}

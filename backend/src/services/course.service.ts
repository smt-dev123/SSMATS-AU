import type { CourseRepository } from "@/repositories/course.repository";
import type { Course } from "@/types/academy";
import type {
  CourseInput,
  CourseUpdateInput,
  CourseQueryInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";

export class CourseService {
  constructor(private readonly courseRepo: CourseRepository) {}

  async create(data: CourseInput): Promise<Course> {
    const course = await this.courseRepo.create(data);
    if (!course) {
      throw new HTTPException(500, { message: "Failed to create course" });
    }
    return course;
  }

  async findAll(query: CourseQueryInput): Promise<{
    data: Course[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.courseRepo.findAll(query);
  }

  async findById(id: number): Promise<Course> {
    const course = await this.courseRepo.findOne(id);
    if (!course) {
      throw new HTTPException(404, { message: "Course not found" });
    }
    return course;
  }

  async update(id: number, data: CourseUpdateInput): Promise<Course> {
    const updated = await this.courseRepo.update(id, data);
    if (!updated) {
      throw new HTTPException(404, { message: "Course not found" });
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.courseRepo.delete(id);
    if (!deleted) {
      throw new HTTPException(404, { message: "Course not found" });
    }
  }

  async getCourseStudents(courseId: number): Promise<any[]> {
    return this.courseRepo.getCourseStudents(courseId);
  }
}

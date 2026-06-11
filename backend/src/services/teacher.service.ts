import { TeacherRepository } from "@/repositories/teacher.repository";
import type {
  CreateTeacher,
  Teacher,
  TeacherQueryInput,
  UpdateTeacher,
} from "@/types/academy";
import { deleteFile, FILENAME_PATTERN, URL_PATTERN } from "@/utils/upload";
import { HTTPException } from "hono/http-exception";
import { basename } from "node:path";

export class TeacherService {
  constructor(private readonly teacherRepo: TeacherRepository) {}

  async create(data: CreateTeacher): Promise<Teacher> {
    return this.teacherRepo.create(data);
  }

  async update(
    id: number,
    data: UpdateTeacher,
    imageURL?: string,
    imageName?: string,
  ): Promise<Teacher> {
    if (Object.keys(data).length === 0 && !imageURL) {
      throw new HTTPException(400, { message: "No data provided" });
    }
    if (imageURL && !URL_PATTERN.test(imageURL)) {
      throw new HTTPException(400, { message: "Invalid image URL" });
    }
    if (imageName && !FILENAME_PATTERN.test(imageName)) {
      throw new HTTPException(400, { message: "Invalid file name" });
    }
    const teacher = await this.teacherRepo.findById(id);
    if (!teacher) {
      throw new HTTPException(404, { message: "Teacher not found" });
    }
    const currentFileName = teacher.image ? basename(teacher.image) : null;
    const isImageChanged = !!imageName;
    const payload =
      isImageChanged && imageURL && imageName
        ? { ...data, image: imageURL }
        : data;

    try {
      const updated = await this.teacherRepo.update(id, payload);
      if (!updated) {
        throw new HTTPException(404, { message: "Teacher not found" });
      }

      if (isImageChanged && currentFileName) {
        try {
          await deleteFile(currentFileName);
        } catch {
          console.log("Failed to delete old profile image");
        }
      }

      return updated;
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: "Failed to update teacher" });
    }
  }

  async delete(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepo.delete(id);
    if (!teacher) {
      throw new HTTPException(404, { message: "Teacher not found" });
    }
    if (teacher.image) {
      try {
        await deleteFile(basename(teacher.image));
      } catch {
        console.log("Failed to delete profile image");
      }
    }
    return teacher;
  }

  async findById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepo.findById(id);
    if (!teacher) {
      throw new HTTPException(404, { message: "Teacher not found" });
    }
    return teacher;
  }

  async findByUserId(userId: string): Promise<Teacher> {
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      throw new HTTPException(404, { message: "Teacher not found" });
    }
    return teacher;
  }

  async findAll(query: TeacherQueryInput): Promise<{
    data: Teacher[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.teacherRepo.findAll(query);
  }
}

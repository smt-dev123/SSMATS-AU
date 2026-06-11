import { db } from "@/database";
import { studentAcademicYears } from "@/database/schemas";
import type { StudentRepository } from "@/repositories/student.repository";
import type {
  CreateStudent,
  Student,
  StudentPromoteInput,
} from "@/types/academy";
import type {
  StudentQueryInput,
  StudentUpdateInput,
} from "@/validators/academy";
import { HTTPException } from "hono/http-exception";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { CourseAttendanceSummary } from "@/types/attendance";
import { deleteFile, FILENAME_PATTERN, URL_PATTERN } from "@/utils/upload";
import { basename } from "node:path";

export class StudentService {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly attendanceRepo: AttendanceRepository,
  ) {}

  async create(data: CreateStudent): Promise<Student> {
    const result = db.transaction(async (tx) => {
      const student = await this.studentRepo.create(data, tx);
      if (!student) {
        throw new HTTPException(400, { message: "Failed to create student" });
      }
      await tx.insert(studentAcademicYears).values({
        studentId: student.id,
        academicYearId: data.academicYearId,
        semester: data.semester,
        year: data.year ?? 1,
      });
      return student;
    });
    return result;
  }

  async update(
    id: number,
    data: StudentUpdateInput,
    imageURL?: string,
    imageName?: string,
  ): Promise<Student> {
    if (Object.keys(data).length === 0 && !imageURL) {
      throw new HTTPException(400, { message: "No data provided" });
    }
    if (imageURL && !URL_PATTERN.test(imageURL)) {
      throw new HTTPException(400, { message: "Invalid image URL" });
    }
    if (imageName && !FILENAME_PATTERN.test(imageName)) {
      throw new HTTPException(400, { message: "Invalid file name" });
    }

    const student = await this.studentRepo.findById(id);
    if (!student) {
      throw new HTTPException(404, { message: "Student not found" });
    }

    const currentFileName = student.image ? basename(student.image) : null;
    const isImageChanged = !!imageName;
    const payload =
      isImageChanged && imageURL && imageName
        ? { ...data, image: imageURL }
        : data;

    try {
      const updated = await this.studentRepo.update(id, payload);
      if (!updated) {
        throw new HTTPException(404, { message: "Student not found" });
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
      throw new HTTPException(500, { message: "Failed to update student" });
    }
  }

  async delete(id: number): Promise<Student> {
    const student = await this.studentRepo.delete(id);
    if (!student) {
      throw new HTTPException(404, { message: "Student not found" });
    }
    if (student.image) {
      try {
        await deleteFile(basename(student.image));
      } catch {
        console.log("Failed to delete profile image");
      }
    }
    return student;
  }

  async findById(id: number): Promise<Student> {
    const student = await this.studentRepo.findById(id);
    if (!student) {
      throw new HTTPException(404, { message: "Student not found" });
    }
    return student;
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) {
      throw new HTTPException(404, { message: "Student not found" });
    }
    return student;
  }

  async findAll(query: StudentQueryInput): Promise<{
    data: Student[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.studentRepo.findAll(query);
  }

  async findScheduleByStudentIdAndCurrentAcademicYear(
    userId: string,
    semester: number,
  ) {
    const result =
      await this.studentRepo.findScheduleByStudentIdAndCurrentAcademicYear(
        userId,
        semester,
      );
    if (!result) {
      throw new HTTPException(404, { message: "Student not found" });
    }
    return result;
  }

  async generateAttendanceReportForStudent(
    userId: string,
  ): Promise<Record<string, CourseAttendanceSummary>> {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) {
      throw new HTTPException(404, { message: "Student not found" });
    }

    const summaries = await this.attendanceRepo.getAttendanceSummaryByStudentId(
      student.id,
    );

    return Object.fromEntries(
      summaries.map((s) => [
        s.courseName,
        {
          total: s.total,
          present: s.present,
          absent: s.absent,
          late: s.late,
          excused: s.excused,
          presentPercentage: s.presentPct,
          absentPercentage: s.absentPct,
          latePercentage: s.latePct,
          excusedPercentage: s.excusedPct,
          absentAndExcusedPercentage: s.absentPct + s.excusedPct,
          withdrawFromExam: s.withdrawFromExam,
          makeUpClass: s.makeUpClass,
        },
      ]),
    );
  }

  async promote(data: StudentPromoteInput): Promise<Student> {
    try {
      const student = await this.studentRepo.promote(data);
      if (!student) {
        throw new HTTPException(404, { message: "Student not found" });
      }
      return student;
    } catch (error: unknown) {
      console.error("Promote Error:", error);
      if (error instanceof Error) {
        throw new HTTPException(500, {
          message: `Backend Error: ${error.message}`,
        });
      }
      throw new HTTPException(500, { message: "Failed to promote student" });
    }
  }
}

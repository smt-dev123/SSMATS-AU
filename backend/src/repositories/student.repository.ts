import { type DrizzleDb, type Transaction } from "@/database";
import {
  academicLevels,
  academicYears,
  departments,
  faculties,
  schedules,
  skills,
  studentAcademicYears,
  students,
  user,
} from "@/database/schemas";
import type {
  CreateStudent,
  Student,
  StudentPromoteInput,
} from "@/types/academy";
import { generateId } from "@/utils/generate-id";
import type {
  StudentQueryInput,
  StudentUpdateInput,
} from "@/validators/academy";
import { and, count, eq, ilike, SQL, exists, desc, getTableColumns } from "drizzle-orm";

export class StudentRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findAll(query: StudentQueryInput): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      facultyId,
      departmentId,
      academicLevelId,
      academicYearId,
      semester,
      year,
      page,
      limit,
      name,
    } = query;

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const conditions: SQL[] = [];
    if (name?.trim()) conditions.push(ilike(user.name, `%${name.trim()}%`));
    if (facultyId && facultyId !== "all")
      conditions.push(eq(students.facultyId, Number(facultyId)));
    if (departmentId && departmentId !== "all")
      conditions.push(eq(students.departmentId, Number(departmentId)));
    if (academicLevelId && academicLevelId !== "all")
      conditions.push(eq(students.academicLevelId, Number(academicLevelId)));

    if (
      (academicYearId && academicYearId !== "all") ||
      (semester && semester !== "all") ||
      (year && year !== "all")
    ) {
      const enrollmentConditions: SQL[] = [
        eq(studentAcademicYears.studentId, students.id),
      ];
      if (academicYearId && academicYearId !== "all")
        enrollmentConditions.push(
          eq(studentAcademicYears.academicYearId, Number(academicYearId)),
        );
      if (semester && semester !== "all")
        enrollmentConditions.push(
          eq(studentAcademicYears.semester, Number(semester)),
        );
      if (year && year !== "all")
        enrollmentConditions.push(eq(studentAcademicYears.year, Number(year)));

      conditions.push(
        exists(
          this.db
            .select({ id: studentAcademicYears.studentId })
            .from(studentAcademicYears)
            .where(and(...enrollmentConditions))
            .limit(1),
        ),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(students),
          name: user.name,
          nameEn: user.nameEn,
          email: user.email,
          faculty: faculties,
          department: departments,
          academicLevel: academicLevels,
          academicYear: academicYears,
          skill: skills,
        })
        .from(students)
        .innerJoin(user, eq(students.userId, user.id))
        .leftJoin(faculties, eq(students.facultyId, faculties.id))
        .leftJoin(departments, eq(students.departmentId, departments.id))
        .leftJoin(academicLevels, eq(students.academicLevelId, academicLevels.id))
        .leftJoin(academicYears, eq(students.academicYearId, academicYears.id))
        .leftJoin(skills, eq(students.skillId, skills.id))
        .where(where)
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit)
        .orderBy(desc(students.createdAt)),
      this.db
        .select({ total: count() })
        .from(students)
        .innerJoin(user, eq(students.userId, user.id))
        .where(where),
    ]);

    const total = countResult[0]?.total ?? 0;

    return { data, total, page: safePage, limit: safeLimit };
  }

  async findById(id: number): Promise<any | undefined> {
    const [result] = await this.db
      .select({
        ...getTableColumns(students),
        name: user.name,
        nameEn: user.nameEn,
        email: user.email,
        faculty: faculties,
        department: departments,
        academicLevel: academicLevels,
        academicYear: academicYears,
        skill: skills,
      })
      .from(students)
      .innerJoin(user, eq(students.userId, user.id))
      .leftJoin(faculties, eq(students.facultyId, faculties.id))
      .leftJoin(departments, eq(students.departmentId, departments.id))
      .leftJoin(academicLevels, eq(students.academicLevelId, academicLevels.id))
      .leftJoin(academicYears, eq(students.academicYearId, academicYears.id))
      .leftJoin(skills, eq(students.skillId, skills.id))
      .where(eq(students.id, id))
      .limit(1);
    return result;
  }

  async findByUserId(id: string): Promise<any | undefined> {
    const [result] = await this.db
      .select({
        ...getTableColumns(students),
        name: user.name,
        nameEn: user.nameEn,
        email: user.email,
        faculty: faculties,
        department: departments,
        academicLevel: academicLevels,
        academicYear: academicYears,
        skill: skills,
      })
      .from(students)
      .innerJoin(user, eq(students.userId, user.id))
      .leftJoin(faculties, eq(students.facultyId, faculties.id))
      .leftJoin(departments, eq(students.departmentId, departments.id))
      .leftJoin(academicLevels, eq(students.academicLevelId, academicLevels.id))
      .leftJoin(academicYears, eq(students.academicYearId, academicYears.id))
      .leftJoin(skills, eq(students.skillId, skills.id))
      .where(eq(students.userId, id))
      .limit(1);
    return result;
  }

  async create(data: any, tx: Transaction): Promise<any | undefined> {
    const studentId = generateId();
    const [student] = await tx
      .insert(students)
      .values({
        ...data,
        id: studentId,
      })
      .returning();
    return student;
  }

  async update(id: number, data: any): Promise<any | undefined> {
    const [student] = await this.db
      .update(students)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async delete(id: number): Promise<any | undefined> {
    const [student] = await this.db
      .delete(students)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async findByFilter(data: {
    facultyId?: number;
    departmentId?: number;
    skillId?: number;
    generation?: number;
  }): Promise<any[]> {
    const conditions: SQL[] = [];
    if (data.facultyId) conditions.push(eq(students.facultyId, data.facultyId));
    if (data.departmentId)
      conditions.push(eq(students.departmentId, data.departmentId));
    if (data.skillId)
      conditions.push(eq(students.skillId, data.skillId));
    if (data.generation)
      conditions.push(eq(students.generation, data.generation));

    return this.db
      .select({
        id: students.id,
        name: user.name,
        userId: students.userId,
      })
      .from(students)
      .innerJoin(user, eq(students.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  async updateStudentAcademicYear(
    facultyId: number,
    departmentId: number,
    academicYearId: number,
    academicLevelId: number,
    tx: Transaction,
  ): Promise<void> {
    await tx
      .update(students)
      .set({ academicYearId, updatedAt: new Date() })
      .where(
        and(
          eq(students.facultyId, facultyId),
          eq(students.departmentId, departmentId),
          eq(students.academicLevelId, academicLevelId),
        ),
      );
  }

  async findScheduleByStudentIdAndCurrentAcademicYear(
    userId: string,
    semester: number,
  ) {
    const [student, currentYear] = await Promise.all([
      this.db.query.students.findFirst({
        where: eq(students.userId, userId),
        columns: { id: true, academicLevelId: true, departmentId: true },
      }),
      this.db.query.academicYears.findFirst({
        where: eq(academicYears.isCurrent, true),
        columns: { id: true },
      }),
    ]);

    if (!student || !currentYear) return null;
    if (!student.academicLevelId || !student.departmentId) return null;

    const results = await this.db.query.schedules.findMany({
      where: and(
        eq(schedules.departmentId, student.departmentId),
        eq(schedules.academicLevelId, student.academicLevelId),
        eq(schedules.academicYearId, currentYear.id),
        eq(schedules.semester, semester),
      ),
      columns: {
        generation: true,
        semester: true,
        semesterStart: true,
        semesterEnd: true,
        studyShift: true,
      },
      with: {
        academicYear: { columns: { name: true } },
        faculty: { columns: { name: true } },
        department: { columns: { name: true } },
        academicLevel: { columns: { level: true } },
        classroom: {
          columns: { name: true },
          with: {
            building: { columns: { name: true } },
          },
        },
        courses: {
          columns: {
            name: true,
            code: true,
            credits: true,
            day: true,
            hours: true,
          },
          with: {
            teacher: {
              columns: { id: true, phone: true },
              with: {
                user: { columns: { name: true } },
              },
            },
          },
        },
      },
    });

    return results.map((s: any) => ({
      ...s,
      courses: s.courses.map((c: any) => ({
        ...c,
        teacher: c.teacher
          ? {
              ...c.teacher,
              name: c.teacher.user?.name,
              phone: c.teacher.phone,
            }
          : null,
      })),
    })) as any;
  }

  async promote(data: StudentPromoteInput): Promise<any | undefined> {
    return await this.db.transaction(async (tx) => {
      await tx
        .insert(studentAcademicYears)
        .values({
          studentId: data.studentId,
          academicYearId: Number(data.academicYearId),
          semester: Number(data.semester),
          year: Number(data.year),
        })
        .onConflictDoNothing();

      const [updatedStudent] = await tx
        .update(students)
        .set({
          academicYearId: Number(data.academicYearId),
          semester: Number(data.semester),
          year: Number(data.year),
          updatedAt: new Date(),
        })
        .where(eq(students.id, data.studentId))
        .returning();

      return updatedStudent;
    });
  }
}

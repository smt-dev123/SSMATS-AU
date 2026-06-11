import z from "zod";

const zBoolean = z.preprocess((v) => {
  if (typeof v === "string") {
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return v;
}, z.boolean());


export const attendanceStatusEnum = z.enum([
  "present",
  "absent",
  "late",
  "excused",
]);

export const markAttendanceSchema = z.object({
  courseId: z.coerce.number().positive(),
  studentId: z.coerce.number().positive(),
  date: z.iso.date(),
  status: attendanceStatusEnum,
  session: z.coerce.number().positive(),
  academicYearId: z.coerce.number().positive(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  recordedBy: z.coerce.number().positive().optional(),
});

export const bulkAttendanceSchema = z.object({
  courseId: z.coerce.number().positive(),
  date: z.iso.date(),
  session: z.coerce.number().positive(),
  academicYearId: z.coerce.number().positive(),
  facultyId: z.coerce.number().positive(),
  departmentId: z.coerce.number().positive(),
  mark: z
    .array(
      z.object({
        studentId: z.coerce.number().positive(),
        status: attendanceStatusEnum,
        notes: z
          .string()
          .max(500, "Notes cannot exceed 500 characters")
          .optional(),
      }),
    )
    .min(1, "At least one attendance record is required"),
});

export const attendanceReportQuerySchema = z.object({
  courseId: z.coerce.number().positive().optional(),
  facultyId: z.coerce.number().positive().optional(),
  departmentId: z.coerce.number().positive().optional(),
  academicYearId: z.coerce.number().positive().optional(),
  generation: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  page: z.coerce.number().positive().optional(),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;

export const attendanceSummarySchema = z.object({
  studentId: z.coerce.number().positive(),
  courseId: z.coerce.number().positive(),
  academicYearId: z.coerce.number().positive(),
  facultyId: z.coerce.number().positive(),
  departmentId: z.coerce.number().positive(),
  totalAttendance: z.coerce.number().positive(),
  presentAttendance: z.coerce.number().positive(),
  absentAttendance: z.coerce.number().positive(),
  lateAttendance: z.coerce.number().positive(),
  excusedAttendance: z.coerce.number().positive(),
  presentPercentage: z.coerce.number().positive(),
  absentPercentage: z.coerce.number().positive(),
  latePercentage: z.coerce.number().positive(),
  excusedPercentage: z.coerce.number().positive(),
  withdrawFromTheExame: zBoolean,
  makeUpClass: zBoolean,
});

export type AttendanceSummaryInput = z.infer<typeof attendanceSummarySchema>;

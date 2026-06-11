import { attendanceRecords } from "@/database/schemas";

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;

export interface CourseAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
  excusedPercentage: number;
  absentAndExcusedPercentage: number;
  withdrawFromExam: boolean;
  makeUpClass: boolean;
}

export type AttendanceSummary = {
  studentId: number;
  courseId: number;
  academicYearId: number;
  facultyId: number;
  departmentId: number;
  totalAttendance: number;
  presentAttendance: number;
  absentAttendance: number;
  lateAttendance: number;
  excusedAttendance: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
  excusedPercentage: number;
  withdrawFromTheExame: boolean;
  makeUpClass: boolean;
};

export type AttendanceData = {
  date: string;
  session: number;
  status: "present" | "absent" | "late" | "excused";
};

export type AttendanceInput = {
  courseId: number;
  studentId: number;
  academicYearId: number;
  date: string;
  session: number;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  recordedBy?: number;
};

export type AttendanceReportQuery = {
  courseId?: number;
  facultyId?: number;
  departmentId?: number;
  academicYearId?: number;
  generation?: number;
  limit?: number;
  page?: number;
};

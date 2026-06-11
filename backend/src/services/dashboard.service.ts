import { DashboardRepository } from "../repositories/dashboard.repository";
import { StudentRepository } from "../repositories/student.repository";
import { TeacherRepository } from "../repositories/teacher.repository";

export class DashboardService {
  constructor(
    private dashboardRepository: DashboardRepository,
    private studentRepository: StudentRepository,
    private teacherRepository: TeacherRepository
  ) {}

  async getDashboardSummary() {
    const counts = await this.dashboardRepository.getCounts();
    const barDataRaw = await this.dashboardRepository.getStudentsByDepartment();
    const trendData = await this.dashboardRepository.getAttendanceTrend();
    const topAtts = await this.dashboardRepository.getTopAttendance();

    // Map colors for barData
    const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
    const barData = barDataRaw.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: colors[index % colors.length],
    }));

    return {
      headerCards: counts,
      barData,
      trendData,
      topAtts,
    };
  }

  async getDashboardSummaryMe(userId: string, role: string) {
    if (role === "student") {
      const student = await this.studentRepository.findByUserId(userId);
      if (!student) return null;
      const stats = await this.dashboardRepository.getStudentStats(student.id);
      const currentClass = await this.dashboardRepository.getCurrentClassForStudent(
        student.id,
      );
      return { stats, currentClass };
    } else if (role === "teacher") {
      const teacher = await this.teacherRepository.findByUserId(userId);
      if (!teacher) return null;
      const stats = await this.dashboardRepository.getTeacherStats(teacher.id);
      const currentClass = await this.dashboardRepository.getCurrentClassForTeacher(
        teacher.id,
      );
      return { stats, currentClass };
    }
    return null;
  }
}


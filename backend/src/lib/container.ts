import { db } from "@/database";
import redis from "@/config/redis";
import { RedisCache } from "@/utils/redis";

// Repositories
import { AcademicLevelRepository } from "@/repositories/academic-level.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { BuildingRepository } from "@/repositories/building.repository";
import { ClassroomRepository } from "@/repositories/classroom.repository";
import { CourseRepository } from "@/repositories/course.repository";
import { DepartmentRepository } from "@/repositories/department.repository";
import { FacultyRepository } from "@/repositories/faculty.repository";
import { ScheduleRepository } from "@/repositories/schedule.repository";
import { SessionTimeRepository } from "@/repositories/session-time.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { TeacherRepository } from "@/repositories/teacher.repository";
import { TranslationRepository } from "@/repositories/translation.repository";
import { NotificationRepository } from "@/repositories/notification.repository";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import { ScheduleOverrideRepository } from "@/repositories/schedule-override.repository";
import { DashboardRepository } from "@/repositories/dashboard.repository";
import { UserRepository } from "@/repositories/user.repository";

// Services
import { AcademicLevelService } from "@/services/academic-level.service";
import { AttendanceService } from "@/services/attendance.service";
import { BuildingService } from "@/services/building.service";
import { ClassroomService } from "@/services/classroom.service";
import { DepartmentService } from "@/services/department.service";
import { FacultyService } from "@/services/faculty.service";
import { ScheduleService } from "@/services/schedule.service";
import { SessionTimeService } from "@/services/session-time.service";
import { StudentService } from "@/services/student.service";
import { TeacherService } from "@/services/teacher.service";
import { TranslationService } from "@/services/translation.service";
import { NotificationService } from "@/services/notification.service";
import { AcademicYearService } from "@/services/academic-year.service";
import { CourseService } from "@/services/course.service";
import { ScheduleOverrideService } from "@/services/schedule-override.service";
import { DashboardService } from "@/services/dashboard.service";
import { UserService } from "@/services/user.service";

// WebSocket
import { WebSocketManager } from "@/lib/ws-manager";
import { SkillRepository } from "@/repositories/skill.repository";
import { SkillService } from "@/services/skill.service";

export interface ICradle {
  // Infrastructure
  db: typeof db;
  redisClient: typeof redis;
  cache: RedisCache;
  wsManager: WebSocketManager;

  // Repositories
  academicLevelRepository: AcademicLevelRepository;
  attendanceRepository: AttendanceRepository;
  buildingRepository: BuildingRepository;
  classroomRepository: ClassroomRepository;
  courseRepository: CourseRepository;
  departmentRepository: DepartmentRepository;
  facultyRepository: FacultyRepository;
  scheduleRepository: ScheduleRepository;
  sessionTimeRepository: SessionTimeRepository;
  studentRepository: StudentRepository;
  teacherRepository: TeacherRepository;
  translationRepository: TranslationRepository;
  notificationRepository: NotificationRepository;
  skillRepository: SkillRepository;
  scheduleOverrideRepository: ScheduleOverrideRepository;
  dashboardRepository: DashboardRepository;
  userRepository: UserRepository;

  // Services
  academicLevelService: AcademicLevelService;
  attendanceService: AttendanceService;
  buildingService: BuildingService;
  classroomService: ClassroomService;
  departmentService: DepartmentService;
  facultyService: FacultyService;
  scheduleService: ScheduleService;
  sessionTimeService: SessionTimeService;
  studentService: StudentService;
  teacherService: TeacherService;
  translationService: TranslationService;
  notificationService: NotificationService;
  academicYearService: AcademicYearService;
  courseService: CourseService;
  skillService: SkillService;
  scheduleOverrideService: ScheduleOverrideService;
  dashboardService: DashboardService;
  userService: UserService;
}

// Instantiate Infrastructure
const cache = new RedisCache(redis);
const wsManager = new WebSocketManager();

// Instantiate Repositories
const academicLevelRepository = new AcademicLevelRepository(db);
const attendanceRepository = new AttendanceRepository(db);
const buildingRepository = new BuildingRepository(db);
const classroomRepository = new ClassroomRepository(db);
const courseRepository = new CourseRepository(db);
const departmentRepository = new DepartmentRepository(db);
const facultyRepository = new FacultyRepository(db);
const scheduleRepository = new ScheduleRepository(db);
const sessionTimeRepository = new SessionTimeRepository(db);
const studentRepository = new StudentRepository(db);
const teacherRepository = new TeacherRepository(db);
const translationRepository = new TranslationRepository(db);
const notificationRepository = new NotificationRepository(db);
const academicYearRepository = new AcademicYearRepository(db);
  const skillRepository = new SkillRepository(db);
const scheduleOverrideRepository = new ScheduleOverrideRepository(db);
const dashboardRepository = new DashboardRepository(db);
const userRepository = new UserRepository(db);
// Instantiate Services
const academicLevelService = new AcademicLevelService(academicLevelRepository);
const attendanceService = new AttendanceService(
  db,
  attendanceRepository,
  courseRepository,
);
const buildingService = new BuildingService(buildingRepository, cache);
const classroomService = new ClassroomService(
  classroomRepository,
  buildingRepository,
  cache,
);
const departmentService = new DepartmentService(departmentRepository);
const facultyService = new FacultyService(facultyRepository);
const scheduleService = new ScheduleService(
  db,
  scheduleRepository,
  courseRepository,
  studentRepository,
);
const sessionTimeService = new SessionTimeService(sessionTimeRepository);
const studentService = new StudentService(
  studentRepository,
  attendanceRepository,
);
const teacherService = new TeacherService(teacherRepository);
const translationService = new TranslationService(translationRepository);
const notificationService = new NotificationService(
  notificationRepository,
  studentRepository,
  teacherRepository,
  wsManager,
);
const academicYearService = new AcademicYearService(db, academicYearRepository);
const courseService = new CourseService(courseRepository);
const skillService = new SkillService(skillRepository);
const scheduleOverrideService = new ScheduleOverrideService(scheduleOverrideRepository, db, notificationService);
const dashboardService = new DashboardService(
  dashboardRepository,
  studentRepository,
  teacherRepository,
);

const userService = new UserService(userRepository);

export const container: ICradle = {
  db,
  redisClient: redis,
  cache,
  wsManager,

  academicLevelRepository,
  attendanceRepository,
  buildingRepository,
  classroomRepository,
  courseRepository,
  departmentRepository,
  facultyRepository,
  scheduleRepository,
  sessionTimeRepository,
  studentRepository,
  teacherRepository,
  translationRepository,
  notificationRepository,
  skillRepository,
  scheduleOverrideRepository,
  dashboardRepository,
  userRepository,

  academicLevelService,
  attendanceService,
  buildingService,
  classroomService,
  departmentService,
  facultyService,
  scheduleService,
  sessionTimeService,
  studentService,
  teacherService,
  translationService,
  notificationService,
  academicYearService,
  courseService,
  skillService,
  scheduleOverrideService,
  dashboardService,
  userService,
};

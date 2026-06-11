export interface BuildingType {
  id?: number
  name: string
  isActive?: boolean
}

export interface RoomType {
  id?: number
  name: string
  classroomNumber: number
  floor: number
  buildingId?: number
  building?: BuildingType
}

export interface GradeLevelType {
  id?: number
  level: AcademicLevelEnum
  description?: string
}

export interface AcademicLevelType {
  id?: number
  level: AcademicLevelEnum
  description?: string
}

export interface SessionTimeType {
  id?: number
  shift: StudyShiftEnum
  firstSessionStartTime: string
  firstSessionEndTime: string
  secondSessionStartTime: string
  secondSessionEndTime: string
  description?: string
  isActive?: boolean
}

export interface ClassesType {
  id?: number
  name: string
  year?: string
  gradeLevelId: number
  roomId: number
  homeroomTeacherId: number
}

export interface GenerationsType {
  id?: number
  name: string
  description: string
}

export interface FacultiesType {
  id?: number
  name: string
  faculty?: {
    id?: number
    name: string
  }
}

export interface DepartmentsType {
  id?: number
  name: string
  description: string
  facultyId: string
  faculty?: {
    id?: number
    name: string
  }
}

export interface MajorsType {
  id?: number
  name: string
  description: string
  facultyId?: number
  faculty?: {
    id?: number
    name: string
  }
}

export interface AcademicYearsType {
  id?: number
  name: string
  startDate: string | Date
  endDate: string | Date
  isCurrent: boolean
}

export interface SubjectsType {
  id?: number
  name: string
  gender: GenderEnum
  gradeLevelId: number
  teacherId: number

  gradeLevel?: {
    id?: number
    name?: string
  }
  teacher?: {
    id?: number
    name?: string
  }
}

export interface TeachersType {
  id?: string
  teacherCode: string
  name: string
  gender: GenderEnum
  email: string
  phone: string
  password: string
  address?: string
  image?: string
  academicLevelId: number
  facultyId: number
  academicLevel?: AcademicLevelType
  faculty?: FacultiesType
  isActive?: boolean
}

export interface StudentsType {
  id?: string
  studentCode: string
  name: string
  nameEn: string
  phone: string
  email: string
  password: string
  facultyId: number
  skillId: number
  departmentId: number
  academicLevelId: number
  academicYearId: number | null
  educationalStatus: EducationalStatusEnum
  year: number | null
  gender: GenderEnum
  generation: number | null
  semester: number | null
  dob?: string | Date
  address?: string
  isActive?: boolean
  academicYear?: AcademicYearsType
  image?: string
}

export interface CoursesType {
  id?: number
  name: string
  code: string
  credits: number
  description?: string
  day: DayEnum
  teacherId: number
  scheduleId: number
  hours: string
  academicYearId: number
  isActive: boolean

  teacher?: {
    id?: number
    name?: string
  }
  schedule?: ScheduleType
}

export interface AttendancesType {
  id?: number
  studentId: number
  classId: number
  date: Date
  status: AttendanceStatusEnum
  note: string

  student?: {
    name: string
  }
  class?: {
    name: string
  }
}

export interface ScheduleType {
  id?: number
  facultyId: number
  year: number
  academicLevelId: number
  generation: number
  departmentId: number
  classroomId: number
  semester: number
  semesterStart: string
  semesterEnd: string
  academicYearId: number
  studyShift: StudyShiftEnum
  sessionTimeId: number

  faculty?: { name: string }
  department?: { name: string }
  academicLevel?: { level: string }
  classroom?: {
    name: string
    building?: { name: string }
  }
  academicYear?: AcademicYearsType
  sessionTime?: SessionTimeType
  courses?: CoursesType[]
  updatedAt?: string
}

export interface TranslationType {
  id?: number
  key: string
  value: string
}

export interface UsersType {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  password?: string
  role: RoleEnum
  image?: string
  twoFactorEnabled: boolean
  createdAt?: string
  updatedAt?: string
}

// Enums
export type DayEnum =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type StudyShiftEnum = 'morning' | 'evening' | 'night'

export type AcademicLevelEnum = 'Associate' | 'Bachelor' | 'Master' | 'PhD'

export type GenderEnum = 'male' | 'female' | 'other'

export type EducationalStatusEnum =
  | 'enrolled'
  | 'suspended'
  | 'graduated'
  | 'dropped_out'
  | 'transferred'

export type AttendanceStatusEnum = 'present' | 'absent' | 'late' | 'excused'

export type RoleEnum = 'admin' | 'teacher' | 'student' | 'staff' | 'manager'

const menuPermissions: Record<string, string[]> = {
  dashboard: ['admin', 'manager', 'staff', 'teacher', 'student'],
  university: ['admin', 'manager', 'staff'],
  building: ['admin', 'manager'],
  room: ['admin', 'manager', 'staff'],
  study: ['admin', 'manager', 'staff', 'teacher', 'student'],
  faculty: ['admin', 'manager', 'staff'],
  department: ['admin', 'manager', 'staff'],
  major: ['admin', 'manager', 'staff'],
  grade_level: ['admin', 'manager', 'staff'],
  academic_year: ['admin', 'manager', 'staff'],
  session_time: ['admin', 'manager', 'staff'],
  notification: ['admin', 'manager', 'staff', 'student', 'teacher'],
  teacher: ['admin', 'manager', 'staff'],
  student: ['admin', 'manager', 'staff'],
  classes: ['admin', 'manager', 'staff', 'teacher', 'student'],
  course: ['admin', 'manager', 'staff', 'teacher', 'student'],
  user: ['admin', 'manager', 'staff'],
  setting: ['admin', 'manager', 'staff', 'teacher', 'student'],
}

export default menuPermissions

import type { CoursesType } from '@/types'

export const checkAttendanceAccess = (
  course: CoursesType | undefined,
  selectedDate: string,
  role: string,
) => {
  if (!course || !role) return { canEdit: false, reason: 'រង់ចាំទិន្នន័យ...' }

  if (role === 'admin' || role === 'manager') return { canEdit: true }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Teachers can only mark attendance for the current date
  if (selectedDate !== todayStr) {
    return {
      canEdit: false,
      reason: 'លោកគ្រូ/អ្នកគ្រូ អាចស្រង់វត្តមានបានតែថ្ងៃនេះប៉ុណ្ណោះ។',
    }
  }

  // Check if it's the correct day of the week for the course
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const currentDay = days[now.getDay()]

  if (course.day !== currentDay) {
    return {
      canEdit: false,
      reason: `ថ្ងៃនេះមិនមែនជាថ្ងៃសិក្សារបស់មុខវិជ្ជា ${course.name} ទេ។`,
    }
  }

  // Check time window: from firstSessionStartTime to secondSessionEndTime + 15 minutes
  const startTime = course.schedule?.sessionTime?.firstSessionStartTime
  const endTime = course.schedule?.sessionTime?.secondSessionEndTime

  if (!startTime || !endTime) {
    return {
      canEdit: false,
      reason: 'មិនទាន់មានម៉ោងសិក្សាផ្លូវការសម្រាប់មុខវិជ្ជានេះនៅឡើយទេ។',
    }
  }

  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  const startDate = new Date(now)
  startDate.setHours(startH, startM, 0, 0)

  const endDate = new Date(now)
  endDate.setHours(endH, endM, 0, 0)
  endDate.setMinutes(endDate.getMinutes() + 15) // 15 minutes buffer

  if (now < startDate) {
    return {
      canEdit: false,
      reason: `លោកគ្រូ/អ្នកគ្រូ អាចស្រង់វត្តមានបានចាប់ពីម៉ោង ${startTime} ឡើងទៅ។`,
    }
  }

  if (now > endDate) {
    return {
      canEdit: false,
      reason: `ផុតម៉ោងស្រង់វត្តមានហើយ (ត្រូវស្រង់មិនឱ្យលើសពី ១៥នាទី ក្រោយបញ្ចប់ម៉ោងសិក្សា)។`,
    }
  }

  return { canEdit: true }
}

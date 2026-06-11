import api from '@/lib/axios'

const ENDPOINT = '/schedules'

export const getSchedules = async (params?: {
  name?: string
  facultyId?: number
  departmentId?: number
  academicYearId?: number | null
  academicLevelId?: number
}) => {
  const res = await api.get(ENDPOINT, {
    params,
  })
  return res.data ?? []
}

export const createSchedule = async (data: any) => {
  const res = await api.post(ENDPOINT, data)
  return res.data
}

export const updateSchedule = async (id: number, data: any) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data)
  return res.data
}

export const deleteSchedule = async (id: number) => {
  const res = await api.delete(`${ENDPOINT}/${id}`)
  return res.data
}

export const getScheduleById = async (id: number) => {
  const res = await api.get(`${ENDPOINT}/${id}`)
  return res.data
}

export const getMySchedule = async (semester: number = 1) => {
  const res = await api.get('/students/schedule/current-academic-year', {
    params: { semester },
  })
  return res.data
}

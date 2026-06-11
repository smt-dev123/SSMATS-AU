import api from '@/lib/axios'

const ENDPOINT = '/schedule-overrides'

export const getOverrides = async (date?: string) => {
  const res = await api.get(ENDPOINT, {
    params: { date },
  })
  return res.data ?? []
}

export const getDailySchedule = async (date: string, facultyId?: number) => {
  const res = await api.get(`${ENDPOINT}/daily`, {
    params: { date, facultyId },
  })
  return res.data ?? []
}

export const createOverride = async (data: any) => {
  const res = await api.post(ENDPOINT, data)
  return res.data
}

export const updateOverride = async (id: number, data: any) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data)
  return res.data
}

export const deleteOverride = async (id: number) => {
  const res = await api.delete(`${ENDPOINT}/${id}`)
  return res.data
}

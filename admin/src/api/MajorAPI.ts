import api from '@/lib/axios'
import type { MajorsType } from '@/types'

export const getMajors = async () => {
  const res = await api.get(`/skills`)
  return res.data.data ?? []
}

export const createMajors = async (newMajors: MajorsType) => {
  const res = await api.post('/skills', newMajors)
  return res.data.data ?? []
}

export const updateMajors = async (id: number, updateMajors: MajorsType) => {
  const res = await api.put(`/skills/${id}`, updateMajors)
  return res.data ?? []
}

export const deleteMajors = async (id: number) => {
  const res = await api.delete(`/skills/${id}`)
  return res.data.data
}

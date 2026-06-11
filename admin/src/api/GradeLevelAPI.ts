import api from '@/lib/axios'
import type { GradeLevelType } from '@/types'

export const getGradeLevel = async () => {
  const res = await api.get('/grade_levels')
  return res.data
}

export const createGradeLevel = async (newGradeLevel: GradeLevelType) => {
  const res = await api.post('/grade_levels', newGradeLevel)
  return res.data
}

export const updateGradeLevel = async (
  id: number,
  updateGradeLevel: GradeLevelType,
) => {
  const res = await api.put(`/grade_levels/${id}`, updateGradeLevel)
  return res.data
}

export const deleteGradeLevel = async (id: number) => {
  const res = await api.delete(`/grade_levels/${id}`)
  return res.data
}

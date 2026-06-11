import api from '@/lib/axios'
import type { AcademicLevelType } from '@/types'

export const getGeneration = async () => {
  const res = await api.get('/academic-levels')
  return res.data.data ?? []
}

export const getGenerationById = async (
  id: number,
): Promise<AcademicLevelType> => {
  const res = await api.get(`/academic-levels/${id}`)
  return res.data.data
}

export const createGeneration = async (newGeneration: AcademicLevelType) => {
  const res = await api.post('/academic-levels', newGeneration)
  return res.data.data
}

export const updateGeneration = async (
  id: number,
  updateGeneration: AcademicLevelType,
) => {
  const res = await api.put(`/academic-levels/${id}`, updateGeneration)
  return res.data.data
}

export const deleteGeneration = async (id: number) => {
  const res = await api.delete(`/academic-levels/${id}`)
  return res.data.data
}

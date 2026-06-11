import api from '@/lib/axios'
import type { AcademicLevelType } from '@/types'

export const getAcademicLevels = async (): Promise<AcademicLevelType[]> => {
  const res = await api.get('/academic-levels')
  return res.data
}

export const getAcademicLevelById = async (
  id: number,
): Promise<AcademicLevelType> => {
  const res = await api.get(`/academic-levels/${id}`)
  return res.data
}

export const createAcademicLevel = async (
  formData: AcademicLevelType,
): Promise<AcademicLevelType> => {
  const res = await api.post('/academic-levels', formData)
  return res.data
}

export const updateAcademicLevel = async (
  id: number,
  formData: AcademicLevelType,
): Promise<AcademicLevelType> => {
  const res = await api.put(`/academic-levels/${id}`, formData)
  return res.data
}

export const deleteAcademicLevel = async (
  id: number,
): Promise<AcademicLevelType> => {
  const res = await api.delete(`/academic-levels/${id}`)
  return res.data
}
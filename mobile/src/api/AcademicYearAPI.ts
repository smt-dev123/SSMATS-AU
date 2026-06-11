import api from '@/lib/axios'
import type { AcademicYearsType } from '@/types'
export const getAcademicYear = async () => {
  const res = await api.get('/academic-years')
  return res.data
}

export const createAcademicYear = async (
  newAcademicYear: AcademicYearsType,
) => {
  const res = await api.post('/academic-years', newAcademicYear)
  return res.data
}

export const updateAcademicYear = async (
  id: number,
  updateAcademicYear: AcademicYearsType,
) => {
  const res = await api.put(`/academic-years/${id}`, updateAcademicYear)
  return res.data.data
}

export const deleteAcademicYear = async (id: number) => {
  const res = await api.delete(`/academic-years/${id}`)
  return res.data.data
}

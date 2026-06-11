import api from '@/lib/axios'
import type { FacultiesType } from '@/types'

export const getFaculties = async () => {
  const res = await api.get('/faculties')
  return res.data
}

export const createFaculties = async (newFaculties: FacultiesType) => {
  const res = await api.post('/faculties', newFaculties)
  return res.data
}

export const updateFaculties = async (
  id: number,
  updateFaculties: FacultiesType,
) => {
  const res = await api.put(`/faculties/${id}`, updateFaculties)
  return res.data
}

export const deleteFaculties = async (id: number) => {
  const res = await api.delete(`/faculties/${id}`)
  return res.data
}

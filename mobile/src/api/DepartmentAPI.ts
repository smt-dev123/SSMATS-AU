import api from '@/lib/axios'
import type { DepartmentsType } from '@/types'

export const getDepartments = async () => {
  const res = await api.get('/departments')
  return res.data
}

export const getDepartmentId = async (id: number) => {
  const res = await api.get(`/departments/${id}`)
  return res.data
}

export const createDepartments = async (newDepartments: DepartmentsType) => {
  const res = await api.post('/departments', newDepartments)
  return res.data
}

export const updateDepartments = async (
  id: number,
  updateDepartments: DepartmentsType,
) => {
  const res = await api.put(`/departments/${id}`, updateDepartments)
  return res.data.data
}

export const deleteDepartments = async (id: number) => {
  const res = await api.delete(`/departments/${id}`)
  return res.data.data
}

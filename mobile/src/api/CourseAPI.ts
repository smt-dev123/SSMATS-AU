import api from '@/lib/axios'
import type { CoursesType } from '@/types'

const ENDPOINT = '/courses'

export const getCourses = async (
  academicYearId?: number,
  page?: number,
  limit?: number,
) => {
  const res = await api.get(ENDPOINT, {
    params: { academicYearId, page, limit },
  })
  return res.data
}

export const createCourse = async (data: CoursesType) => {
  const res = await api.post(ENDPOINT, data)
  return res.data.data
}

export const updateCourse = async (id: number, data: CoursesType) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data)
  return res.data.data
}

export const deleteCourse = async (id: number) => {
  const res = await api.delete(`${ENDPOINT}/${id}`)
  return res.data.data
}

export const getCourseById = async (id: number) => {
  const res = await api.get(`${ENDPOINT}/${id}`)
  return res.data.data
}

export const getCourseStudents = async (id: number) => {
  const res = await api.get(`${ENDPOINT}/${id}/students`)
  return res.data.data ?? []
}

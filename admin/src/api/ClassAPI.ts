import api from '@/lib/axios'
import type { ClassesType } from '@/types'

export const getClass = async () => {
  const res = await api.get('/classes?_embed=faculty&_embed=room&_embed=gradeLevels&_embed=generations')
  return res.data.data ?? []
}

export const createClass = async (newClass: ClassesType) => {
  const res = await api.post('/classes?_embed=faculty&_embed=room&_embed=gradeLevels&_embed=generations', newClass)
  return res.data.data
}

export const updateClass = async (
  id: number,
  updateClass: ClassesType,
) => {
  const res = await api.put(`/classes/${id}?_embed=faculty&_embed=room&_embed=gradeLevels&_embed=generations`, updateClass)
  return res.data.data
}

export const deleteClass = async (id: number) => {
  const res = await api.delete(`/classes/${id}?_embed=faculty&_embed=room&_embed=gradeLevels&_embed=generations`)
  return res.data.data
}

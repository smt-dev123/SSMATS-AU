import api from '@/lib/axios'

export const getTeachers = async (
  name?: string,
  facultyId?: string,
  academicLevelId?: string,
  page: number = 1,
  limit: number = 10,
) => {
  const res = await api.get('/teachers', {
    params: {
      name: name || undefined,
      facultyId: facultyId || undefined,
      academicLevelId: academicLevelId || undefined,
      page,
      limit,
    },
  })
  return res.data
}

export const createTeachers = async (data: any) => {
  const res = await api.post('/teachers', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data?.data ?? []
}

export const updateTeachers = async (id: string, data: any) => {
  const res = await api.put(`/teachers/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data?.data
}

export const deleteTeachers = async (id: string) => {
  const res = await api.delete(`/teachers/${id}`)
  return res.data?.data
}

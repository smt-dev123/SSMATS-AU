import api from '@/lib/axios'

const ENDPOINT = '/students'

export const getStudents = async (
  name?: string,
  facultyId?: string,
  departmentId?: string,
  academicLevelId?: string,
  academicYearId?: number | null,
  page: number = 1,
  limit: number = 10,
) => {
  const res = await api.get(ENDPOINT, {
    params: {
      name: name || undefined,
      facultyId: facultyId || undefined,
      departmentId: departmentId || undefined,
      academicLevelId: academicLevelId || undefined,
      academicYearId,
      page,
      limit,
    },
  })
  return res.data
}

export const promoteStudent = async (data: {
  studentId: number
  academicYearId: number
  year: number
  semester: number
}) => {
  const res = await api.post(`${ENDPOINT}/promote`, data)
  return res.data
}

export const createStudent = async (data: any) => {
  const res = await api.post(ENDPOINT, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export const updateStudent = async (id: string, data: any) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export const deleteStudent = async (id: string) => {
  const res = await api.delete(`${ENDPOINT}/${id}`)
  return res.data
}

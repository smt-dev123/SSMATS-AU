import api from '@/lib/axios'
import type { AttendancesType } from '@/types'

const ENDPOINT = '/attendances'

export const getAttendances = async () => {
    const res = await api.get(ENDPOINT)
    return res.data.data ?? []
}

export const createAttendance = async (data: AttendancesType) => {
    const res = await api.post(ENDPOINT, data)
    return res.data.data
}

export const updateAttendance = async (id: number, data: AttendancesType) => {
    const res = await api.put(`${ENDPOINT}/${id}`, data)
    return res.data.data
}

export const deleteAttendance = async (id: number) => {
    const res = await api.delete(`${ENDPOINT}/${id}`)
    return res.data.data
}

export const getCourseAttendance = async (courseId: number, date: string, session?: number) => {
    let url = `/attendance/course/${courseId}?date=${date}`
    if (session) url += `&session=${session}`
    const res = await api.get(url)
    return res.data
}

export const markBulkAttendance = async (data: any) => {
    const res = await api.post(`/attendance/bulk`, data)
    return res.data
}

export const getCourseAttendanceReport = async (courseId: number) => {
    const res = await api.get(`/attendance/report`, { params: { courseId } })
    return res.data.data ?? []
}
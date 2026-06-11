import api from '@/lib/axios'
import type { SessionTimeType } from '@/types'

export const getSessionTime = async () => {
  const res = await api.get('/session-times')
  return res.data
}

export const getSessionTimeById = async (id: number) => {
  const res = await api.get(`/session-times/${id}`)
  return res.data
}

export const createSessionTime = async (
  newSessionTime: SessionTimeType,
) => {
  const res = await api.post('/session-times', newSessionTime)
  return res.data
}

export const updateSessionTime = async (
  id: number,
  updateSessionTime: SessionTimeType,
) => {
  const res = await api.put(`/session-times/${id}`, updateSessionTime)
  return res.data
}

export const deleteSessionTime = async (id: number) => {
  const res = await api.delete(`/session-times/${id}`)
  return res.data
}

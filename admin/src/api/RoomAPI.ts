import api from '@/lib/axios'
import type { RoomType } from '@/types'

export const getRoom = async (name?: string, page?: number, limit?: number) => {
  const res = await api.get('/classrooms', { params: { name, page, limit } })
  return res.data
}

export const createRoom = async (newRoom: RoomType) => {
  const res = await api.post('/classrooms', newRoom)
  return res.data?.data ?? []
} 

export const updateRoom = async (id: number, updateRoom: RoomType) => {
  const res = await api.put(`/classrooms/${id}`, updateRoom)
  return res.data?.data
}

export const deleteRoom = async (id: number) => {
  const res = await api.delete(`/classrooms/${id}`)
  return res.data?.data
}

import api from '@/lib/axios'

export interface BroadcastNotificationData {
  title: string
  message: string
  facultyId: number
  targetDepartment?: number
  targetGeneration?: number
  priority?: "low" | "normal" | "high"
}

export const broadcastNotification = async (data: BroadcastNotificationData) => {
  const res = await api.post('/notifications/broadcast', data)
  return res.data
}

export const getNotifications = async () => {
  const res = await api.get('/notifications')
  return res.data
}

export const getMyNotifications = async () => {
  const res = await api.get('/notifications/my-notifications')
  return res.data
}

export const markNotificationAsRead = async (id: number) => {
  const res = await api.patch(`/notifications/read/${id}`)
  return res.data
}

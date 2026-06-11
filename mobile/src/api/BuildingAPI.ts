import api from '@/lib/axios'
import type { BuildingType } from '@/types'

export const getBuilding = async (
  name?: string,
  search?: string,
  page?: number,
  limit?: number,
) => {
  const res = await api.get('/buildings', {
    params: { name, search, page, limit },
  })
  return res.data
}

export const createBuilding = async (newBuilding: BuildingType) => {
  const res = await api.post('/buildings', newBuilding)
  return res.data.data
}

export const updateBuilding = async (
  id: number,
  updateBuilding: BuildingType,
) => {
  const res = await api.put(`/buildings/${id}`, updateBuilding)
  return res.data.data
}

export const deleteBuilding = async (id: number) => {
  const res = await api.delete(`/buildings/${id}`)
  return res.data.data
}

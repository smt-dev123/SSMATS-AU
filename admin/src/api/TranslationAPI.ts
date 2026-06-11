import api from '@/lib/axios'
import type { TranslationType } from '@/types'

const ENDPOINT = '/translations'

export const getTranslations = async () => {
  const res = await api.get(ENDPOINT)
  return res.data.data ?? []
}

export const createTranslation = async (data: TranslationType) => {
  const res = await api.post(ENDPOINT, data)
  return res.data.data
}

export const updateTranslation = async (id: number, data: TranslationType) => {
  const res = await api.put(`${ENDPOINT}/${id}`, data)
  return res.data.data
}

export const deleteTranslation = async (id: number) => {
  const res = await api.delete(`${ENDPOINT}/${id}`)
  return res.data.data
}

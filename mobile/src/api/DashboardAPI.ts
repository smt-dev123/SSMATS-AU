import api from '@/lib/axios'

export const getDashboardSummaryMe = async () => {
  const res = await api.get('/dashboard/summary-me')
  return res.data
}

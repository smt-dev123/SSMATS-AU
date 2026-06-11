import { getAcademicYear } from '@/api/AcademicYearAPI'
import { useQuery } from '@tanstack/react-query'

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: getAcademicYear,
  })
}

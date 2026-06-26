import { useQuery } from '@tanstack/react-query'
import { getAcademicYear } from '@/api/AcademicYearAPI'

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: getAcademicYear,
  })
}

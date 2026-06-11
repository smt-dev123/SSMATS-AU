import { getAcademicYear } from '@/api/AcademicYearAPI'
import { AcademicYearTable } from '@/features/academic_year/GenerationTable'
import { useTitle } from '@/hooks/useTitle'
import { Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import AcademicYearCreate from './-actions/Create'
import FetchData from '@/components/FetchData'

export const Route = createFileRoute('/admin/academic_year/')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('Generation Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['academic_years'],
    queryFn: getAcademicYear,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  })

  const academic_years = data

  if (isLoading || error) {
    return <FetchData isLoading={isLoading} error={error} data={data} />
  }

  return (
    <>
      <Flex direction="column" gap="2" mb="4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <Text size="5" className="font-bold">
            តារាងឆ្នាំសិក្សា
          </Text>

          <AcademicYearCreate />
        </div>
      </Flex>
      <AcademicYearTable data={academic_years} />
    </>
  )
}

import { GradeLevelTable } from '@/features/gradeLevel/GradeLevelTable'
import { useTitle } from '@/hooks/useTitle'
import { Button, Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import GradeLevleCreate from './-actions/Create'
import FetchData from '@/components/FetchData'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'

export const Route = createFileRoute('/admin/grade_level/')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('Level Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['academic_levels'],
    queryFn: getAcademicLevels,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  })

  if (isLoading || error) {
    return <FetchData isLoading={isLoading} error={error} data={data} />
  }
  return (
    <>
      <Flex direction="column" gap="2" mb="4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <Text size="5" className="font-bold">
            តារាងកម្រិតថ្នាក់
          </Text>

          <GradeLevleCreate />
        </div>
      </Flex>

      <GradeLevelTable data={data ?? []} />
    </>
  )
}

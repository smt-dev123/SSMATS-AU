import { GenerationTable } from '@/features/generation/GenerationTable'
import { useTitle } from '@/hooks/useTitle'
import { Button, Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import GenerationCreate from './-actions/Create'
import FetchData from '@/components/FetchData'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'

export const Route = createFileRoute('/admin/generation/')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('Generation Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['academic-levels'],
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
            តារាងជំនាន់សិក្សា
          </Text>
          <Flex gap="2">
            {/* Export */}
            <Button variant="outline" style={{ cursor: 'pointer' }}>
              Export Excel
            </Button>

            <Button variant="outline" style={{ cursor: 'pointer' }}>
              បោះពុម្ភ
            </Button>

            <GenerationCreate />
          </Flex>
        </div>
      </Flex>
      <GenerationTable data={data ?? []} />
    </>
  )
}

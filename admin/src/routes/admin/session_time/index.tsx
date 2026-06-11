import { useTitle } from '@/hooks/useTitle'
import { Button, Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import FetchData from '@/components/FetchData'
import { getSessionTime } from '@/api/SessionTime'
import SessionTimeCreate from './-actions/Create'
import { SessionTimeTable } from '@/features/session_time/SessionTimeTable'

export const Route = createFileRoute('/admin/session_time/')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('Session Time Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['session_times'],
    queryFn: getSessionTime,
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
            តារាងម៉ោងសិក្សា
          </Text>
          <SessionTimeCreate />
        </div>
      </Flex>
      <SessionTimeTable data={data} />
    </>
  )
}

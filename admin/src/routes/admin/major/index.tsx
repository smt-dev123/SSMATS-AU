import { getMajors } from '@/api/MajorAPI'
import { MajorTable } from '@/features/major/MajorTable'
import { useTitle } from '@/hooks/useTitle'
import { Button, Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import MajorCreate from './-actions/Create'
import FetchData from '@/components/FetchData'
import { useSessionContext } from '@/providers/AuthProvider'

export const Route = createFileRoute('/admin/major/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role
  useTitle('Major Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['majors'],
    queryFn: getMajors,
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
            តារាងជំនាញសិក្សា
          </Text>
          <Flex gap="2">
            {['admin', 'manager', 'staff'].includes(role) && <MajorCreate />}
          </Flex>
        </div>
      </Flex>
      <MajorTable data={data} />
    </>
  )
}

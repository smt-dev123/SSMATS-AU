import { getFaculties } from '@/api/FacultyAPI'
import { FacultiesTable } from '@/features/faculties/FacultyTable'
import { useTitle } from '@/hooks/useTitle'
import { Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import FacultyCreate from './-actions/Create'
import FetchData from '@/components/FetchData'
import { useSessionContext } from '@/providers/AuthProvider'

export const Route = createFileRoute('/admin/faculty/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role
  useTitle('Faculty Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
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
            តារាងមហាវិទ្យាល័យ
          </Text>
          {['admin', 'manager', 'staff'].includes(role) && <FacultyCreate />}
        </div>
      </Flex>
      <FacultiesTable data={data} />
    </>
  )
}

import { getDepartments } from '@/api/DepartmentAPI'
import { DepartmentTable } from '@/features/department/DepartmentTable'
import { useTitle } from '@/hooks/useTitle'
import { Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import DepartmentCreate from './-actions/Create'
import FetchData from '@/components/FetchData'
import { useSessionContext } from '@/providers/AuthProvider'

export const Route = createFileRoute('/admin/department/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role
  useTitle('Department Management')

  const { data, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
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
            តារាងតេប៉ាតឺម៉ង់
          </Text>
          {['admin', 'manager', 'staff'].includes(role) && <DepartmentCreate />}
        </div>
      </Flex>
      <DepartmentTable data={data} />
    </>
  )
}

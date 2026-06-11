import { getRoom } from '@/api/RoomAPI'
import { RoomTable } from '@/features/room/RoomTable'
import { Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import RoomCreate from './-actions/Create'
import { useTitle } from '@/hooks/useTitle'
import FetchData from '@/components/FetchData'
import { useSessionContext } from '@/providers/AuthProvider'

import { useNavigate } from '@tanstack/react-router'

type RoomSearch = {
  page?: number
  limit?: number
}

export const Route = createFileRoute('/admin/room/')({
  validateSearch: (search: Record<string, unknown>): RoomSearch => {
    return {
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 10,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role
  useTitle('Room Management')

  const { page, limit } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data, isLoading, error } = useQuery({
    queryKey: ['rooms', 'all', page, limit],
    queryFn: () => getRoom('all', page, limit),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  })

  const total = (data as any)?.total || 0
  const pageCount = Math.ceil(total / (limit ?? 10))

  const onPaginationChange = (updater: any) => {
    const newState =
      typeof updater === 'function'
        ? updater({ pageIndex: (page ?? 1) - 1, pageSize: limit ?? 10 })
        : updater
    navigate({
      search: (prev) => ({
        ...prev,
        page: newState.pageIndex + 1,
        limit: newState.pageSize,
      }),
    })
  }

  if (isLoading || error) {
    return <FetchData isLoading={isLoading} error={error} data={data} />
  }

  return (
    <>
      <Flex direction="column" gap="2" mb="4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <Flex gap="2">
            <Text size="5" className="font-bold">
              តារាងបន្ទប់សិក្សា
            </Text>
          </Flex>
          {['admin', 'manager', 'staff'].includes(role) && <RoomCreate />}
        </div>
      </Flex>

      <RoomTable
        data={data?.data || []}
        pageCount={pageCount}
        paginationState={{
          pageIndex: (page ?? 1) - 1,
          pageSize: limit ?? 10,
        }}
        onPaginationChange={onPaginationChange}
      />
    </>
  )
}

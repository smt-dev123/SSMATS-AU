import { getBuilding } from '@/api/BuildingAPI'
import { BuildingTable } from '@/features/building/BuildingTable'
import { useTitle } from '@/hooks/useTitle'
import { Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import BuildingCreate from './-actions/Create'
import ExportExcel from './-exports/ExportExcel'
import { BuildingReport } from './-exports/ExportPDF'
import FetchData from '@/components/FetchData'
import PDFDownload from '@/components/ui/PDFDownload'

import { useNavigate } from '@tanstack/react-router'
import { useSessionContext } from '@/providers/AuthProvider'

type BuildingSearch = {
  page?: number
  limit?: number
}

export const Route = createFileRoute('/admin/building/')({
  validateSearch: (search: Record<string, unknown>): BuildingSearch => {
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
  useTitle('Building Management')
  const { page, limit } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data, isLoading, error } = useQuery({
    queryKey: ['buildings', 'all', '', page, limit],
    queryFn: () => getBuilding('all', '', page, limit),
    staleTime: 1000 * 60 * 5,
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
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <Text size="5" className="font-bold">
            តារាងអាគារសិក្សា
          </Text>
          <Flex gap="2">
            <PDFDownload
              document={<BuildingReport data={data?.data || []} />}
              fileName="building-report.pdf"
            />
            <ExportExcel data={data?.data || []} />
            {['admin', 'manager', 'staff'].includes(role) && <BuildingCreate />}
          </Flex>
        </div>
      </Flex>

      <BuildingTable
        data={data?.data || []}
        pageCount={pageCount}
        paginationState={{
          pageIndex: (page ?? 1) - 1,
          pageSize: limit ?? 10,
        }}
        onPaginationChange={onPaginationChange}
      />
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          data.map((building: any) => (
            <BuildingCard key={building.id} building={building} onEdit={() => { }} onDelete={() => { }} onView={() => { }} />
          ))
        }
      </div> */}
    </>
  )
}

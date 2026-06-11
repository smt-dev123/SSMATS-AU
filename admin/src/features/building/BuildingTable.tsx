import { DataTable } from '@/components/table/DataTable'
import type { BuildingType } from '@/types'
import { BuildingColumns } from './Columns'
import type { OnChangeFn, PaginationState } from '@tanstack/react-table'

interface Props {
  data: BuildingType[]
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  paginationState?: PaginationState
}

export function BuildingTable({
  data,
  pageCount,
  onPaginationChange,
  paginationState,
}: Props) {
  return (
    <DataTable
      data={data}
      columns={BuildingColumns}
      pageCount={pageCount}
      manualPagination={true}
      onPaginationChange={onPaginationChange}
      paginationState={paginationState}
    />
  )
}

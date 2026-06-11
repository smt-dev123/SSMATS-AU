import { DataTable } from '@/components/table/DataTable'
import type { RoomType } from '@/types'
import { RoomColumns } from './Columns'

import { type OnChangeFn, type PaginationState } from '@tanstack/react-table'

interface Props {
  data: RoomType[]
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  paginationState?: PaginationState
}

export function RoomTable({
  data,
  pageCount,
  onPaginationChange,
  paginationState,
}: Props) {
  return (
    <DataTable
      data={data}
      columns={RoomColumns}
      pageCount={pageCount}
      manualPagination={true}
      onPaginationChange={onPaginationChange}
      paginationState={paginationState}
    />
  )
}

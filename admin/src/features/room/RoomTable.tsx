import { RoomColumns } from './Columns'
import type { RoomType } from '@/types'
import type {OnChangeFn, PaginationState} from '@tanstack/react-table';
import { DataTable } from '@/components/table/DataTable'


interface Props {
  data: Array<RoomType>
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

import { TeachaerColumns } from './Columns'
import type { TeachersType } from '@/types'
import type { OnChangeFn, PaginationState } from '@tanstack/react-table'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<TeachersType>
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  paginationState?: PaginationState
}

export function TeacherTable({
  data,
  pageCount,
  onPaginationChange,
  paginationState,
}: Props) {
  return (
    <DataTable
      data={data}
      columns={TeachaerColumns}
      pageCount={pageCount}
      manualPagination={true}
      onPaginationChange={onPaginationChange}
      paginationState={paginationState}
    />
  )
}

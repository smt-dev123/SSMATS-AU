import { DataTable } from '@/components/table/DataTable'
import { TeachaerColumns } from './Columns'
import type { TeachersType } from '@/types'
import type { PaginationState, OnChangeFn } from '@tanstack/react-table'

interface Props {
  data: TeachersType[]
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

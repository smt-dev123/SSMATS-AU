import { DataTable } from '@/components/table/DataTable'
import type { StudentsType } from '@/types'
import { StudentColumns } from './Columns'
import type { PaginationState, OnChangeFn } from '@tanstack/react-table'

interface Props {
  data: StudentsType[]
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  paginationState?: PaginationState
}

export function StudentTable({
  data,
  pageCount,
  onPaginationChange,
  paginationState,
}: Props) {
  return (
    <DataTable
      data={data}
      columns={StudentColumns}
      pageCount={pageCount}
      manualPagination={true}
      onPaginationChange={onPaginationChange}
      paginationState={paginationState}
    />
  )
}

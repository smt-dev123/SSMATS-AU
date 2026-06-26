import { StudentColumns } from './Columns'
import type { StudentsType } from '@/types'
import type { OnChangeFn, PaginationState } from '@tanstack/react-table'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<StudentsType>
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

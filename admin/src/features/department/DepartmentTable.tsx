import { DepartmentColumns } from './Columns'
import type { DepartmentsType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<DepartmentsType>
}

export function DepartmentTable({ data }: Props) {
  return <DataTable data={data} columns={DepartmentColumns} />
}

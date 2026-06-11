import { DataTable } from '@/components/table/DataTable'
import type { DepartmentsType } from '@/types'
import { DepartmentColumns } from './Columns'

interface Props {
  data: DepartmentsType[]
}

export function DepartmentTable({ data }: Props) {
  return <DataTable data={data} columns={DepartmentColumns} />
}

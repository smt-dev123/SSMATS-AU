import { DataTable } from '@/components/table/DataTable'
import type { AcademicLevelType } from '@/types'
import { AcademicLevelColumns } from './Columns'

interface Props {
  data: AcademicLevelType[]
}

export function GradeLevelTable({ data }: Props) {
  return <DataTable data={data} columns={AcademicLevelColumns} />
}

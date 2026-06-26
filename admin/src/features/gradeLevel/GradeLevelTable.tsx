import { AcademicLevelColumns } from './Columns'
import type { AcademicLevelType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<AcademicLevelType>
}

export function GradeLevelTable({ data }: Props) {
  return <DataTable data={data} columns={AcademicLevelColumns} />
}

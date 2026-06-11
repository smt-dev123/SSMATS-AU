import { DataTable } from '@/components/table/DataTable'
import type { AcademicLevelType } from '@/types'
import { GenerationColumns } from './Columns'

interface Props {
  data: AcademicLevelType[]
}

export function GenerationTable({ data }: Props) {
  return <DataTable data={data} columns={GenerationColumns} />
}

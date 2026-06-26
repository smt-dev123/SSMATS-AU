import { GenerationColumns } from './Columns'
import type { AcademicLevelType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<AcademicLevelType>
}

export function GenerationTable({ data }: Props) {
  return <DataTable data={data} columns={GenerationColumns} />
}

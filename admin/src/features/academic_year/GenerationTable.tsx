import { AcademicYearColumns } from './Columns'
import type { AcademicYearsType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<AcademicYearsType>
}

export function AcademicYearTable({ data }: Props) {
  return <DataTable data={data} columns={AcademicYearColumns} />
}

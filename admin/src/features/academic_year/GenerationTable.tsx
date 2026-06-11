import { DataTable } from '@/components/table/DataTable'
import type { AcademicYearsType } from '@/types'
import { AcademicYearColumns } from './Columns'

interface Props {
  data: AcademicYearsType[]
}

export function AcademicYearTable({ data }: Props) {
  return <DataTable data={data} columns={AcademicYearColumns} />
}

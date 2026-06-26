import { FacultiesColumns } from './Columns'
import type { FacultiesType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<FacultiesType>
}

export function FacultiesTable({ data }: Props) {
  return <DataTable data={data} columns={FacultiesColumns} />
}

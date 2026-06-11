import { DataTable } from '@/components/table/DataTable'
import type { FacultiesType } from '@/types'
import { FacultiesColumns } from './Columns'

interface Props {
  data: FacultiesType[]
}

export function FacultiesTable({ data }: Props) {
  return <DataTable data={data} columns={FacultiesColumns} />
}

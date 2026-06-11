import { DataTable } from '@/components/table/DataTable'
import type { MajorsType } from '@/types'
import { MajorColumns } from './Columns'

interface Props {
  data: MajorsType[]
}

export function MajorTable({ data }: Props) {
  return <DataTable data={data} columns={MajorColumns} />
}

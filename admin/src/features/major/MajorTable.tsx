import { MajorColumns } from './Columns'
import type { MajorsType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<MajorsType>
}

export function MajorTable({ data }: Props) {
  return <DataTable data={data} columns={MajorColumns} />
}

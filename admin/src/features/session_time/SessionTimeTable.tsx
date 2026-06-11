import { DataTable } from '@/components/table/DataTable'
import type { SessionTimeType } from '@/types'
import { SessionTimeColumns } from './Columns'

interface Props {
  data: SessionTimeType[]
}

export function SessionTimeTable({ data }: Props) {
  return <DataTable data={data} columns={SessionTimeColumns} />
}

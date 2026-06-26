import { SessionTimeColumns } from './Columns'
import type { SessionTimeType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<SessionTimeType>
}

export function SessionTimeTable({ data }: Props) {
  return <DataTable data={data} columns={SessionTimeColumns} />
}

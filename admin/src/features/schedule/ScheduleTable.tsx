import { ScheduleColumns } from './Columns'
import type { ScheduleType } from '@/types'
import { DataTable } from '@/components/table/DataTable'

interface Props {
  data: Array<ScheduleType>
}

export function ScheduleTable({ data }: Props) {
  return <DataTable data={data} columns={ScheduleColumns} />
}

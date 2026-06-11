import { DataTable } from '@/components/table/DataTable'
import type { ScheduleType } from '@/types'
import { ScheduleColumns } from './Columns'

interface Props {
  data: ScheduleType[]
}

export function ScheduleTable({ data }: Props) {
  return <DataTable data={data} columns={ScheduleColumns} />
}

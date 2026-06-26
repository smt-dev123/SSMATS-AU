import { getUserColumns } from './Columns'
import type { UsersType } from '@/types'
import { DataTable } from '@/components/table/DataTable'
import { useSessionContext } from '@/providers/AuthProvider'

interface Props {
  data: Array<UsersType>
}

export function UserTable({ data }: Props) {
  const { data: session } = useSessionContext()

  const currentRole = (session?.user as any)?.role || ''

  const columns = getUserColumns(currentRole)

  return <DataTable data={data} columns={columns} />
}

import SessionTimeDelete from '@/routes/admin/session_time/-actions/Delete'
import SessionTimeUpdate from '@/routes/admin/session_time/-actions/Update'
import type { SessionTimeType } from '@/types'
import { Badge, Flex } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'

export const SessionTimeColumns: ColumnDef<SessionTimeType>[] = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1},
  { accessorKey: 'shift', header: 'ពេលសិក្សា' },
  { accessorKey: 'firstSessionStartTime', header: 'ម៉ោងចូលរៀនវគ្គទី១' },
  { accessorKey: 'firstSessionEndTime', header: 'ម៉ោងចេញរៀនវគ្គទី១' },
  { accessorKey: 'secondSessionStartTime', header: 'ម៉ោងចូលរៀនវគ្គទី២' },
  { accessorKey: 'secondSessionEndTime', header: 'ម៉ោងចេញរៀនវគ្គទី២' },
  { accessorKey: 'description', header: 'បរិយាយ' },
  {
    accessorKey: 'isActive',
    header: 'ស្ថានភាព',
    cell: ({ row }) => {
      const isActive = row.original.isActive
      return (
        <Badge variant="soft" color={isActive ? 'blue' : 'red'}>
          {isActive ? 'សកម្ម' : 'អសកម្ម'}
        </Badge>
      )
    },
  },
  {
    id: 'session-time-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <SessionTimeUpdate data={row.original} />
        <SessionTimeDelete data={row.original} />
      </Flex>
    ),
  },
]

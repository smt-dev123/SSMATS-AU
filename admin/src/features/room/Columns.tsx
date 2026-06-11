import RoomDelete from '@/routes/admin/room/-actions/Delete'
import RoomUpdate from '@/routes/admin/room/-actions/Update'
import type { RoomType } from '@/types'
import { Flex } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'

export const RoomColumns: ColumnDef<RoomType>[] = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1},
  { accessorKey: 'name', header: 'បន្ទប់សិក្សា' },
  {
    accessorKey: 'floor',
    header: 'ជាន់ទី',
    cell: ({ row }) =>
      row.original.floor === 0 ? 'ផ្ទាល់ដី' : `${row.original.floor}`,
  },
  { accessorKey: 'classroomNumber', header: 'លេខបន្ទប់' },
  { accessorKey: 'building.name', header: 'អាគារសិក្សា' },
  {
    id: 'room-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <RoomUpdate data={row.original} />
        <RoomDelete data={row.original} />
      </Flex>
    ),
  },
]

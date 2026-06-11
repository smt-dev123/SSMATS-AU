import MajorDelete from '@/routes/admin/major/-actions/Delete'
import MajorUpdate from '@/routes/admin/major/-actions/Update'
import type { MajorsType } from '@/types'
import { Flex } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'

export const MajorColumns: ColumnDef<MajorsType>[] = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1},
  { accessorKey: 'name', header: 'មុខជំនាញ' },
  { accessorKey: 'faculty.name', header: 'មហាវិទ្យាល័យ' },
  {
    id: 'major-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <MajorUpdate data={row.original} />
        <MajorDelete data={row.original} />
      </Flex>
    ),
  },
]

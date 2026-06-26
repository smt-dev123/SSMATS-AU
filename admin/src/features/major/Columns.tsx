import { Flex } from '@radix-ui/themes'
import type { MajorsType } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import MajorDelete from '@/routes/admin/major/-actions/Delete'
import MajorUpdate from '@/routes/admin/major/-actions/Update'

export const MajorColumns: Array<ColumnDef<MajorsType>> = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1 },
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

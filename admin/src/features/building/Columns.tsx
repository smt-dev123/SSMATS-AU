import BuildingDelete from '@/routes/admin/building/-actions/Delete'
import BuildingUpdate from '@/routes/admin/building/-actions/Update'
import type { BuildingType } from '@/types'
import { Badge, Flex } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'

export const BuildingColumns: ColumnDef<BuildingType>[] = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1},
  { accessorKey: 'name', header: 'អាគារសិក្សា' },
  {
    accessorKey: 'isActive',
    header: 'ស្ថានភាព',
    cell: ({ row }) => (
      <Badge color={row.original.isActive ? 'blue' : 'red'}>
        {row.original.isActive ? 'បង្ហាញ' : 'មិនបង្ហាញ'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <BuildingUpdate data={row.original} />
        <BuildingDelete data={row.original} />
      </Flex>
    ),
  },
]

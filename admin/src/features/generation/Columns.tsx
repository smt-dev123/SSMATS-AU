import GenerationDelete from '@/routes/admin/generation/-actions/Delete'
import GenerationUpdate from '@/routes/admin/generation/-actions/Update'
import type { AcademicLevelType } from '@/types'
import { Flex } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'

export const GenerationColumns: ColumnDef<AcademicLevelType>[] = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1},
  { accessorKey: 'level', header: 'កម្រិតថ្នាក់' },
  {
    id: 'generation-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <GenerationUpdate data={row.original} />
        <GenerationDelete data={row.original} />
      </Flex>
    ),
  },
]

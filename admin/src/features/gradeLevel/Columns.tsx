import GradeLevleDelete from '@/routes/admin/grade_level/-actions/Delete'
import GradeLevleUpdate from '@/routes/admin/grade_level/-actions/Update'
import type { AcademicLevelType } from '@/types'
import { Flex } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'

export const AcademicLevelColumns: ColumnDef<AcademicLevelType>[] = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1},
  { accessorKey: 'level', header: 'កម្រិតថ្នាក់' },
  {
    id: 'academic_level-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <GradeLevleUpdate data={row.original} />
        <GradeLevleDelete data={row.original} />
      </Flex>
    ),
  },
]

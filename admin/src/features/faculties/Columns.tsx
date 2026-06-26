import { Flex } from '@radix-ui/themes'
import type { FacultiesType } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import FacultyDelete from '@/routes/admin/faculty/-actions/Delete'
import FacultyUpdate from '@/routes/admin/faculty/-actions/Update'

export const FacultiesColumns: Array<ColumnDef<FacultiesType>> = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1 },
  { accessorKey: 'name', header: 'មហាវិទ្យាល័យ' },
  {
    id: 'faculty-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <FacultyUpdate data={row.original} />
        <FacultyDelete data={row.original} />
      </Flex>
    ),
  },
]

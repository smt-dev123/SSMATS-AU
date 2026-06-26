import { Flex } from '@radix-ui/themes'
import type { DepartmentsType } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import DepartmentDelete from '@/routes/admin/department/-actions/Delete'
import DepartmentUpdate from '@/routes/admin/department/-actions/Update'

export const DepartmentColumns: Array<ColumnDef<DepartmentsType>> = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1 },
  { accessorKey: 'name', header: 'តេប៉ាតឺម៉ង់' },
  { accessorKey: 'faculty.name', header: 'មហាវិទ្យាល័យ' },
  {
    id: 'department-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <DepartmentUpdate data={row.original} />
        <DepartmentDelete data={row.original} />
      </Flex>
    ),
  },
]

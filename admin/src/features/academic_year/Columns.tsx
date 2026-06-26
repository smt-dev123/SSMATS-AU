import { Flex } from '@radix-ui/themes'
import type { AcademicYearsType } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import AcademicYearDelete from '@/routes/admin/academic_year/-actions/Delete'
import AcademicYearUpdate from '@/routes/admin/academic_year/-actions/Update'
import { formatDate } from '@/hooks/useDate'

export const AcademicYearColumns: Array<ColumnDef<AcademicYearsType>> = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1 },
  { accessorKey: 'name', header: 'ឆ្នាំសិក្សា' },
  {
    accessorKey: 'startDate',
    header: 'ថ្ងៃចាប់ផ្ដើម',
    cell: ({ getValue }) => formatDate(getValue<string>()).display(),
  },
  {
    accessorKey: 'endDate',
    header: 'ថ្ងៃបញ្ចប់',
    cell: ({ getValue }) => formatDate(getValue<string>()).display(),
  },
  {
    accessorKey: 'isCurrent',
    header: 'ស្ថានភាព',
    cell: ({ row }) => {
      const isCurrent = row.original.isCurrent
      return (
        <div
          className={`px-2 py-1 rounded-full text-center text-xs font-bold w-fit ${
            isCurrent
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isCurrent ? 'បច្ចុប្បន្ន' : 'ចាស់'}
        </div>
      )
    },
  },
  {
    id: 'academic-year-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => (
      <Flex gap="2">
        <AcademicYearUpdate data={row.original} />
        <AcademicYearDelete data={row.original} />
      </Flex>
    ),
  },
]

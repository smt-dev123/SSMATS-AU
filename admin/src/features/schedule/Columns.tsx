import { Badge, Flex, IconButton } from '@radix-ui/themes'
import { FaRegEdit, FaRegEye } from 'react-icons/fa'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { ScheduleType } from '@/types'
import { useSessionContext } from '@/providers/AuthProvider'
import ScheduleDelete from '@/routes/admin/schedule/-actions/Delete'

export const ScheduleColumns: Array<ColumnDef<ScheduleType>> = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1 },
  {
    header: 'មហាវិទ្យាល័យ/ដេប៉ាតឺម៉ង់',
    cell: ({ row }) => {
      const s = row.original
      return `${s.faculty?.name || ''} / ${s.department?.name || ''}`
    },
  },
  {
    header: 'ជំនាន់/ឆ្នាំ/ឆមាស',
    cell: ({ row }) => {
      const s = row.original
      return `ជំនាន់ទី ${s.generation} (ឆ្នាំទី ${s.year} ឆមាស ${s.semester})`
    },
  },
  {
    accessorKey: 'studyShift',
    header: 'វេនសិក្សា',
    cell: ({ row }) => (
      <Badge color={row.original.studyShift === 'morning' ? 'blue' : 'orange'}>
        {row.original.studyShift === 'morning'
          ? 'ព្រឹក'
          : row.original.studyShift === 'evening'
            ? 'ល្ងាច'
            : 'យប់'}
      </Badge>
    ),
  },
  {
    header: 'បន្ទប់/អគារ',
    cell: ({ row }) => {
      const s = row.original
      return `${s.classroom?.name || ''} (${s.classroom?.building?.name || ''})`
    },
  },
  {
    id: 'actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => <ScheduleActions row={row} />,
  },
]

function ScheduleActions({ row }: { row: any }) {
  const s = row.original
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  return (
    <Flex gap="2">
      <IconButton
        size="1"
        color="blue"
        variant="surface"
        style={{ cursor: 'pointer' }}
        asChild
      >
        <Link
          to="/admin/schedule/$scheduleId"
          params={{ scheduleId: String(row.original.id) }}
        >
          <FaRegEye />
        </Link>
      </IconButton>

      {['admin', 'manager', 'staff'].includes(role) && (
        <IconButton
          size="1"
          color="orange"
          variant="surface"
          style={{ cursor: 'pointer' }}
          onClick={() => s.onEdit?.(s.id)}
        >
          <FaRegEdit />
        </IconButton>
      )}

      {['admin', 'manager', 'staff'].includes(role) && (
        <ScheduleDelete data={row.original} />
      )}
    </Flex>
  )
}

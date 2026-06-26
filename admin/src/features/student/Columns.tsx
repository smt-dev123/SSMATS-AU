import { Avatar, Badge, Flex, Text } from '@radix-ui/themes'
import type { StudentsType } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import StudentDetail from '@/routes/admin/student/-actions/ShowDetail'
import StudentDelete from '@/routes/admin/student/-actions/Delete'
import StudentPromote from '@/routes/admin/student/-actions/StudentPromote'
import StudentUpdate from '@/routes/admin/student/-actions/Update'
import ChangePassword from '@/routes/admin/user/-actions/ChangePassword'
import { useSessionContext } from '@/providers/AuthProvider'

const getStatusColor = (status: StudentsType['educationalStatus']) => {
  switch (status) {
    case 'enrolled':
      return 'green'
    case 'suspended':
      return 'yellow'
    case 'graduated':
      return 'blue'
    case 'dropped_out':
      return 'red'
    case 'transferred':
      return 'orange'
    default:
      return 'gray'
  }
}

const handleViewImage = (imageUrl: string) => {
  window.open(imageUrl, '_blank')
}

export const StudentColumns: Array<ColumnDef<StudentsType>> = [
  { accessorKey: 'index', header: 'ល.រ', cell: ({ row }) => row.index + 1 },
  {
    accessorKey: 'image',
    header: 'រូបភាព',
    cell: ({ row }) => {
      const imageUrl =
        `${import.meta.env.VITE_API_BASE_URL}${row.original.image}`.replace(
          '/api',
          '',
        )
      return (
        <Avatar
          size="3"
          src={imageUrl}
          fallback={row.original.name?.charAt(0) || 'S'}
          radius="full"
          onClick={() => handleViewImage(imageUrl)}
          style={{ cursor: 'pointer' }}
        />
      )
    },
  },
  { accessorKey: 'studentCode', header: 'លេខសម្គាល់' },
  { accessorKey: 'name', header: 'ឈ្មោះ' },
  { accessorKey: 'nameEn', header: 'ឈ្មោះអង់គ្លេស' },
  { accessorKey: 'gender', header: 'ភេទ' },
  {
    id: 'grade',
    header: 'ថ្នាក់សិក្សា',
    cell: ({ row }) => (
      <Text size="2">
        ឆ្នាំទី {row.original.year} ឆមាស {row.original.semester}
      </Text>
    ),
  },
  { accessorKey: 'phone', header: 'លេខទូរស័ព្ទ' },
  { accessorKey: 'address', header: 'អាស័យដ្ឋាន' },
  {
    accessorKey: 'status',
    header: 'ស្ថានភាព',
    cell: ({ row }) => {
      const status = row.original.educationalStatus || 'enrolled'
      return (
        <Badge color={getStatusColor(status)} variant="surface">
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'student-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => <StudentActions row={row} />,
  },
]

function StudentActions({ row }: { row: any }) {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  return (
    <Flex gap="2">
      {['admin', 'manager', 'staff'].includes(role) && (
        <StudentPromote student={row.original} />
      )}
      <StudentDetail data={row.original} />

      {['admin', 'manager'].includes(role) && row.original.userId && (
        <ChangePassword
          user={{ id: row.original.userId, name: row.original.name } as any}
        />
      )}
      {['admin', 'manager', 'staff'].includes(role) && (
        <StudentUpdate data={row.original} />
      )}
      {['admin', 'manager', 'staff'].includes(role) && (
        <StudentDelete data={row.original} />
      )}
    </Flex>
  )
}

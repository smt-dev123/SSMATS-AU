import { Avatar, Badge, Flex } from '@radix-ui/themes'
import type { TeachersType } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import TeacherDetail from '@/routes/admin/teacher/-actions/ShowDetail'
import TeacherDelete from '@/routes/admin/teacher/-actions/Delete'
import TeacherUpdate from '@/routes/admin/teacher/-actions/Update'
import TeacherScheduleDialog from '@/routes/admin/teacher/-actions/TeacherScheduleDialog'
import ChangePassword from '@/routes/admin/user/-actions/ChangePassword'
import { useSessionContext } from '@/providers/AuthProvider'

const handleViewImage = (imageUrl: string) => {
  window.open(imageUrl, '_blank')
}

export const TeachaerColumns: Array<ColumnDef<TeachersType>> = [
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
  { accessorKey: 'teacherCode', header: 'លេខសម្គាល់គ្រូ' },
  { accessorKey: 'name', header: 'គោត្តនាម-នាម' },
  { accessorKey: 'gender', header: 'ភេទ' },
  { accessorKey: 'faculty.name', header: 'មហាវិទ្យាល័យ' },
  { accessorKey: 'email', header: 'អ៊ីម៉ែល' },
  { accessorKey: 'phone', header: 'លេខទូរស័ព្ទ' },
  { accessorKey: 'address', header: 'អាសយដ្ឋាន' },
  {
    accessorKey: 'isActive',
    header: 'ស្ថានភាព',
    cell: ({ row }) => (
      <Badge color={row.original.isActive ? 'green' : 'red'} variant="surface">
        {row.original.isActive ? 'សកម្ម' : 'អសកម្ម'}
      </Badge>
    ),
  },
  {
    id: 'teacher-actions',
    header: 'សកម្មភាព',
    enableSorting: false,
    cell: ({ row }) => <TeacherActions row={row} />,
  },
]

function TeacherActions({ row }: { row: any }) {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  return (
    <Flex gap="2">
      <TeacherDetail data={row.original} />
      <TeacherScheduleDialog data={row.original} />

      {['admin', 'manager'].includes(role) && row.original.userId && (
        <ChangePassword
          user={{ id: row.original.userId, name: row.original.name } as any}
        />
      )}

      {['admin', 'manager', 'staff'].includes(role) && (
        <>
          <TeacherUpdate data={row.original} />
          <TeacherDelete data={row.original} />
        </>
      )}
    </Flex>
  )
}

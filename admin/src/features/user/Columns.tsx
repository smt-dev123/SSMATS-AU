import type { UsersType } from '@/types'
import { Avatar, Badge, Flex, IconButton } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'
import { FaRegEye } from 'react-icons/fa'

import UserUpdate from '@/routes/admin/user/-actions/Update'
import UserDelete from '@/routes/admin/user/-actions/Delete'
import ChangePassword from '@/routes/admin/user/-actions/ChangePassword'

const handleViewImage = (imageUrl: string) => {
  window.open(imageUrl, '_blank')
}

const roleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'red'
    case 'manager':
      return 'orange'
    case 'teacher':
      return 'blue'
    case 'staff':
      return 'green'
    default:
      return 'gray'
  }
}

export const getUserColumns = (userRole: string): ColumnDef<UsersType>[] => {
  const columns: ColumnDef<UsersType>[] = [
    {
      accessorKey: 'no',
      header: 'ល.រ',
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: 'image',
      header: 'រូបភាព',
      cell: ({ row }) => {
        const imageUrl = `${row.original.image}`.replace('/api', '')
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
    { accessorKey: 'name', header: 'ឈ្មោះ' },
    { accessorKey: 'email', header: 'អ៊ីមែល' },
    {
      accessorKey: 'role',
      header: 'តួនាទី',
      cell: ({ row }) => (
        <Badge color={roleColor(row.original.role)} variant="surface">
          {row.original.role.toUpperCase()}
        </Badge>
      ),
    },
  ]

  if (userRole === 'admin' || userRole === 'manager') {
    columns.push({
      id: 'user-actions',
      header: 'សកម្មភាព',
      enableSorting: false,
      cell: ({ row }) => (
        <Flex gap="2">
          <IconButton
            size="1"
            color="blue"
            variant="surface"
            style={{ cursor: 'pointer' }}
          >
            <FaRegEye />
          </IconButton>

          <ChangePassword user={row.original} />
          <UserUpdate user={row.original} />

          <UserDelete userId={row.original.id} userName={row.original.name} />
        </Flex>
      ),
    })
  }

  return columns
}

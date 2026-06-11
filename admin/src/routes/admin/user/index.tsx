import { useTitle } from '@/hooks/useTitle'
import { Box, Flex, Text, TextField } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { IoSearch } from 'react-icons/io5'
import { UserTable } from '@/features/user/UserTable'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/UserAPI'
import FetchData from '@/components/FetchData'
import { useState } from 'react'
import UserCreate from './-actions/Create'
import { useSessionContext } from '@/providers/AuthProvider'

export const Route = createFileRoute('/admin/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('User Management')
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  if (isLoading || error) {
    return <FetchData isLoading={isLoading} error={error} data={data} />
  }

  const filteredData = data.filter(
    (user: any) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <Flex direction="column" gap="4">
        <Flex direction="column">
          <Flex justify="between" mb="4">
            <Text size="5" className="font-bold">
              អ្នកប្រើប្រាស់
            </Text>
            {['admin', 'manager'].includes(role) && <UserCreate />}
          </Flex>
          {/* Header */}
          <Flex justify="between">
            {/* Search */}
            <Box width="250px" maxWidth="250px">
              <TextField.Root
                placeholder="ស្វែងរក..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              >
                <TextField.Slot>
                  <IoSearch height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </Box>
          </Flex>
        </Flex>

        {/* Table */}
        <UserTable data={filteredData} />
      </Flex>
    </div>
  )
}

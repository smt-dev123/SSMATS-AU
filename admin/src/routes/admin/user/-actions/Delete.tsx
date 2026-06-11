import { Button, Dialog, Flex, IconButton, Text } from '@radix-ui/themes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FaRegTrashAlt } from 'react-icons/fa'
import { deleteUsers } from '@/api/UserAPI'
import { useState } from 'react'

interface Props {
  userId: string
  userName: string
}

const UserDelete = ({ userId, userName }: Props) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: () => deleteUsers(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('លុបអ្នកប្រើប្រាស់ជោគជ័យ')
      setOpen(false)
    },
    onError: (error: any) => {
      const data = error?.response?.data
      toast.error(data?.message || 'ការលុបមិនជោគជ័យ')
    },
  })

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton
          size="1"
          color="red"
          variant="surface"
          style={{ cursor: 'pointer' }}
        >
          <FaRegTrashAlt />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="400px">
        <Dialog.Title>លុបអ្នកប្រើប្រាស់</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ <Text weight="bold">"{userName}"</Text> មែនទេ?
          ការលុបនេះមិនអាចយកមកវិញបានទេ។
        </Dialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>
              ចាកចេញ
            </Button>
          </Dialog.Close>
          <Button
            variant="solid"
            color="red"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            style={{ cursor: 'pointer' }}
          >
            លុប
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default UserDelete

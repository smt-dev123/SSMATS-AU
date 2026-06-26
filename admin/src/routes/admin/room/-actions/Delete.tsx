import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertDialog, IconButton } from '@radix-ui/themes'
import { FaRegTrashAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import type { RoomType } from '@/types'
import { deleteRoom } from '@/api/RoomAPI'
import DeleteDialog from '@/components/action/DeleteDialog'

interface Props {
  data: RoomType
}

const RoomDelete = ({ data }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteRoom(Number(data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('លុបជោគជ័យ')
    },
    onError: () => {
      toast.error('លុបមិនជោគជ័យ')
    },
  })

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <IconButton
          size="1"
          color="red"
          variant="surface"
          style={{ cursor: 'pointer' }}
        >
          <FaRegTrashAlt />
        </IconButton>
      </AlertDialog.Trigger>

      <DeleteDialog
        title="ព្រមាន"
        description={`តើអ្នកពិតជាចង់លុបបន្ទប់${data.name} មែនទេ?`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AlertDialog.Root>
  )
}

export default RoomDelete

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertDialog, IconButton } from '@radix-ui/themes'
import DeleteDialog from '@/components/action/DeleteDialog'
import { FaRegTrashAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import type { SessionTimeType } from '@/types'
import { deleteSessionTime } from '@/api/SessionTime'

interface Props {
  data: SessionTimeType
}

const SessionTimeDelete = ({ data }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteSessionTime(Number(data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session_times'] })
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
        description={`តើអ្នកពិតជាចង់លុបឆ្នាំសិក្សា${data.shift} មែនទេ?`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AlertDialog.Root>
  )
}

export default SessionTimeDelete

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertDialog, IconButton } from '@radix-ui/themes'
import DeleteDialog from '@/components/action/DeleteDialog'
import { FaRegTrashAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import type { FacultiesType } from '@/types'
import { deleteFaculties } from '@/api/FacultyAPI'

interface Props {
  data: FacultiesType
}

const FacultyDelete = ({ data }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteFaculties(Number(data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] })
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
        description={`តើអ្នកពិតជាចង់មហាវិទ្យាល័យ${data.name} មែនទេ?`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AlertDialog.Root>
  )
}

export default FacultyDelete

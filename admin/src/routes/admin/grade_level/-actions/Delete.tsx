import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertDialog, IconButton } from '@radix-ui/themes'
import DeleteDialog from '@/components/action/DeleteDialog'
import { FaRegTrashAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { deleteAcademicLevel } from '@/api/AcademicLevelAPI'
import type { GradeLevelType } from '@/types'

interface Props {
  data: GradeLevelType
}

const GradeLevleDelete = ({ data }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteAcademicLevel(Number(data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_levels'] })
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
        description={`តើអ្នកពិតជាចង់លុបកម្រិតថ្នាក់${data.level} មែនទេ?`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AlertDialog.Root>
  )
}

export default GradeLevleDelete

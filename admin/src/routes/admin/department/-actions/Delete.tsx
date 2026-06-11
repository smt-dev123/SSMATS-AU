import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertDialog, IconButton } from '@radix-ui/themes'
import DeleteDialog from '@/components/action/DeleteDialog'
import { FaRegTrashAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { deleteDepartments } from '@/api/DepartmentAPI'
import type { DepartmentsType } from '@/types'

interface Props {
  data: DepartmentsType
}

const DepartmentDelete = ({ data }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteDepartments(Number(data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
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
        description={`តើអ្នកពិតជាចង់លុបដេប៉ាតឺម៉ង់${data.name} មែនទេ?`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AlertDialog.Root>
  )
}

export default DepartmentDelete

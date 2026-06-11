import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertDialog } from '@radix-ui/themes'
import DeleteDialog from '@/components/action/DeleteDialog'
import toast from 'react-hot-toast'
import type { CoursesType } from '@/types'
import { deleteCourse } from '@/api/CourseAPI'

interface Props {
  data: CoursesType
}

const CourseDelete = ({ data }: Props) => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => await deleteCourse(Number(data.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('លុបជោគជ័យ')
    },
    onError: () => {
      toast.error('លុបមិនជោគជ័យ')
    },
  })

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <button className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
          លុប
        </button>
      </AlertDialog.Trigger>

      <DeleteDialog
        title="ព្រមាន"
        description={`តើអ្នកពិតជាចង់លុបវគ្គសិក្សា ${data.name} មែនទេ?`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AlertDialog.Root>
  )
}

export default CourseDelete

import type { FacultiesType, MajorsType } from '@/types'
import { Button, Dialog, Flex, IconButton } from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { updateMajors } from '@/api/MajorAPI'
import { getFaculties } from '@/api/FacultyAPI'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'

interface Props {
  data: MajorsType
}

const MajorUpdate = ({ data }: Props) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MajorsType>({
    defaultValues: {
      name: data.name,
      description: data.description || '',
      facultyId: data.facultyId,
    },
  })

  const { data: faculties } = useQuery<FacultiesType[]>({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })

  const mutation = useMutation({
    mutationFn: (formData: MajorsType) =>
      updateMajors(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['majors'] })
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: MajorsType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        name: data.name,
        description: data.description || '',
        facultyId: data.facultyId,
      })
    }
  }, [open, data, reset])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton
          size="1"
          color="blue"
          variant="surface"
          style={{ cursor: 'pointer' }}
        >
          <FaRegEdit />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>កែប្រែមុខជំនាញ</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="3">
              <FormInput
                label="មុខជំនាញ"
                placeholder="សូមបំពេញឈ្មោះមុខជំនាញ"
                error={errors.name}
                register={register}
                name="name"
                rules={{
                  required: 'សូមបំពេញឈ្មោះមុខជំនាញ',
                }}
                isRequired
              />

              <FormSelect
                label="មហាវិទ្យាល័យ"
                placeholder="សូមជ្រើសរើសមហាវិទ្យាល័យ"
                error={errors.facultyId}
                control={control}
                name="facultyId"
                rules={{
                  required: 'សូមជ្រើសរើសមហាវិទ្យាល័យ',
                }}
                isRequired
                valueAsNumber
                options={faculties ?? []}
                labelKey="name"
              />
            </Flex>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                ចាកចេញ
              </Button>
            </Dialog.Close>
            <Button type="submit">រក្សាទុក</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default MajorUpdate

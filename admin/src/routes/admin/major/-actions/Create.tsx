import { useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { FacultiesType, MajorsType } from '@/types'
import { createMajors } from '@/api/MajorAPI'
import { getFaculties } from '@/api/FacultyAPI'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'

const MajorCreate = () => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MajorsType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: faculties } = useQuery<FacultiesType[]>({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })

  const mutation = useMutation({
    mutationFn: (formData: MajorsType) => createMajors(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['majors'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: MajorsType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមជំនាញសិក្សា
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="450px"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>បន្ថែមជំនាញសិក្សា</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
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

export default MajorCreate

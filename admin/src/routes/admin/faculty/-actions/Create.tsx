import { useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { FacultiesType } from '@/types'
import { createFaculties } from '@/api/FacultyAPI'
import { FormInput } from '@/components/ui/forms/Input'

const FacultyCreate = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacultiesType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: FacultiesType) => createFaculties(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: FacultiesType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមមហាវិទ្យាល័យ
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>បន្ថែមមហាវិទ្យាល័យ</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <FormInput
              label="មហាវិទ្យាល័យ"
              placeholder="សូមបញ្ចូលឈ្មោះមហាវិទ្យាល័យ"
              error={errors.name}
              register={register}
              name="name"
              rules={{
                required: 'សូមបញ្ចូលឈ្មោះមហាវិទ្យាល័យ',
              }}
              isRequired
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

export default FacultyCreate

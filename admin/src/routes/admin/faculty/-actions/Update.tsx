import { Button, Dialog, Flex, IconButton } from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import type { FacultiesType } from '@/types'
import { updateFaculties } from '@/api/FacultyAPI'
import { FormInput } from '@/components/ui/forms/Input'

interface Props {
  data: FacultiesType
}

const FacultyUpdate = ({ data }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacultiesType>({
    defaultValues: {
      name: data.name,
    },
  })
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: FacultiesType) =>
      updateFaculties(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] })
      setOpen(false)
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: FacultiesType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        name: data.name,
      })
    }
  }, [open, data, reset])

  return (
    <>
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
          <Dialog.Title>កែប្រែ</Dialog.Title>

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
              <Button type="submit">
                {mutation.isPending ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export default FacultyUpdate

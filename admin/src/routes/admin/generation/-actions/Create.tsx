import { useState } from 'react'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AcademicLevelType } from '@/types'
import { createGeneration } from '@/api/GenerationAPI'

const GenerationCreate = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicLevelType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: AcademicLevelType) => createGeneration(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-levels'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: AcademicLevelType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមជំនាន់សិក្សា
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>បន្ថែមជំនាន់សិក្សា</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                ជំនាន់
              </Text>
              <TextField.Root
                {...register('level', { required: 'Name is required' })}
                placeholder="Enter name"
                type="number"
                min="1"
              />
              {errors.level && (
                <Text size="2" color="red">
                  {errors.level.message}
                </Text>
              )}
            </label>
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

export default GenerationCreate

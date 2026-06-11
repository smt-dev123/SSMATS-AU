import { useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { GradeLevelType } from '@/types'
import { createAcademicLevel } from '@/api/AcademicLevelAPI'
import { FormSelect } from '@/components/ui/forms/Input'

const GradeLevleCreate = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeLevelType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: GradeLevelType) => createAcademicLevel(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_levels'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 409) {
        toast.error('Level already exists!')
      } else {
        toast.error('Failed to create level')
      }
    },
  })

  const onSubmit = (formData: GradeLevelType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមបន្ទប់សិក្សា
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>បន្ថែមបន្ទប់សិក្សា</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <FormSelect
              name="level"
              label="កម្រិតសិក្សា"
              placeholder="សូមជ្រើសរើសកម្រិតសិក្សា"
              control={control}
              register={register}
              options={[
                { id: 'Associate', name: 'Associate' },
                { id: 'Bachelor', name: 'Bachelor' },
                { id: 'Master', name: 'Master' },
                { id: 'PhD', name: 'PhD' },
              ]}
              error={errors.level}
              isRequired
            />
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                ចាកចេញ
              </Button>
            </Dialog.Close>
            <Button type="submit" loading={mutation.isPending}>
              រក្សាទុក
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default GradeLevleCreate

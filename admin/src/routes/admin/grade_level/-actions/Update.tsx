import { Button, Dialog, Flex, IconButton } from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import type { GradeLevelType } from '@/types'
import { updateAcademicLevel } from '@/api/AcademicLevelAPI'
import { FormSelect } from '@/components/ui/forms/Input'

interface Props {
  data: GradeLevelType
}

const GradeLevleUpdate = ({ data }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeLevelType>({
    defaultValues: {
      level: data.level,
      description: data?.description,
    },
  })
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: GradeLevelType) =>
      updateAcademicLevel(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_levels'] })
      setOpen(false)
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: GradeLevelType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        level: data.level,
        description: data.description,
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

        <Dialog.Content
          maxWidth="450px"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Dialog.Title>កែប្រែ</Dialog.Title>

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
    </>
  )
}

export default GradeLevleUpdate

import type { BuildingType } from '@/types'
import { Button, Dialog, Flex, IconButton } from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateBuilding } from '@/api/BuildingAPI'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { FormInput } from '@/components/ui/forms/Input'
import { FormCheckbox } from '@/components/ui/forms/Checkbox'

interface Props {
  data: BuildingType
}

const BuildingUpdate = ({ data }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BuildingType>({
    defaultValues: {
      name: data.name,
      isActive: data.isActive,
    },
  })
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: BuildingType) =>
      updateBuilding(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      setOpen(false)
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: BuildingType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        name: data.name,
        isActive: data.isActive,
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
                label="អាគារសិក្សា"
                placeholder="សូមបំពេញឈ្មោះអាគារសិក្សា"
                error={errors.name}
                register={register}
                name="name"
                rules={{
                  required: 'ត្រូវជ្រើសរើសអាគារសិក្សា',
                  minLength: {
                    value: 3,
                    message: 'អាគារសិក្សាត្រូវមានយ៉ាងតិច 3 តួអក្សរ',
                  },
                }}
                isRequired
              />
              <FormCheckbox
                control={control}
                label="ស្ថានភាព"
                placeholder="សកម្ម (Active)"
                name="isActive"
                error={errors.isActive}
              />
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => {
                  reset()
                  setOpen(false)
                }}
              >
                ចាកចេញ
              </Button>
              <Button type="submit">រក្សាទុក</Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export default BuildingUpdate

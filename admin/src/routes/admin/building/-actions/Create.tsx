import type { BuildingType } from '@/types'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBuilding } from '@/api/BuildingAPI'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormInput } from '@/components/ui/forms/Input'

const BuildingCreate = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuildingType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: BuildingType) => createBuilding(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: BuildingType) => {
    mutation.mutate(formData)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button variant="solid" style={{ cursor: 'pointer' }}>
            បន្ថែមអាគារសិក្សា
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <Dialog.Title>បន្ថែមអាគារសិក្សា</Dialog.Title>

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

export default BuildingCreate

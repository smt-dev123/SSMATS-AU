import { useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { BuildingType, RoomType } from '@/types'
import { createRoom } from '@/api/RoomAPI'
import { getBuilding } from '@/api/BuildingAPI'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'
const RoomCreate = () => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoomType>()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: buildingsResponse } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => getBuilding('all'),
  })

  const buildings = ((buildingsResponse as any)?.data as BuildingType[]) || []

  const mutation = useMutation({
    mutationFn: (formData: RoomType) => createRoom(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'បង្កើតមិនជោគជ័យ'
      if (message === 'លេខបន្ទប់ក្នុងអាគារនេះមានរួចហើយ') {
        setError('classroomNumber', {
          type: 'manual',
          message: message,
        })
      } else {
        toast.error(message)
      }
    },
  })

  const onSubmit = (formData: RoomType) => {
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
            {/* Room name */}
            <FormInput
              label="បន្ទប់សិក្សា"
              placeholder="សូមបញ្ចូលឈ្មោះបន្ទប់"
              error={errors.name}
              register={register}
              name="name"
              rules={{
                required: 'សូមបញ្ចូលបន្ទប់សិក្សា',
                minLength: { value: 3, message: 'យ៉ាងហោចណាស់ ៣ខ្ទង់' },
              }}
              isRequired
            />

            <FormInput
              label="ជាន់បន្ទប់សិក្សា"
              placeholder="សូមបញ្ចូលលេខជាន់"
              error={errors.floor}
              register={register}
              name="floor"
              type="number"
              rules={{
                valueAsNumber: true,
                required: 'សូមបញ្ចូលលេខជាន់',
                min: { value: 0, message: 'សូមបញ្ចូលលេខជាន់ត្រឹមត្រូវ' },
                max: { value: 10, message: 'លេខជាន់មិនអាចលើសពី ១០ បានទេ' },
              }}
              min={0}
              max={10}
              isRequired
            />

            <FormInput
              label="លេខបន្ទប់សិក្សា"
              placeholder="សូមបញ្ចូលលេខបន្ទប់សិក្សា"
              error={errors.classroomNumber}
              register={register}
              name="classroomNumber"
              type="number"
              rules={{
                valueAsNumber: true,
                required: 'សូមបញ្ចូលលេខបន្ទប់សិក្សា',
              }}
              isRequired
            />

            {/* Building Select */}
            <FormSelect
              label="អាគារសិក្សា"
              placeholder="សូមបញ្ចូលអាគារសិក្សា"
              error={errors.buildingId}
              register={register}
              control={control}
              name="buildingId"
              rules={{
                required: 'សូមបញ្ចូលអាគារសិក្សា',
              }}
              options={
                buildings?.map((building: BuildingType) => ({
                  id: building.id,
                  name: building.name,
                })) || []
              }
              isRequired
              valueAsNumber={true}
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
  )
}

export default RoomCreate

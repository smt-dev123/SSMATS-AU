import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Text,
  Select,
  TextField,
} from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import type { AcademicLevelType } from '@/types'
import { updateGeneration } from '@/api/GenerationAPI'

interface Props {
  data: AcademicLevelType
}

const GenerationUpdate = ({ data }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AcademicLevelType>({
    defaultValues: {},
  })

  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: AcademicLevelType) =>
      updateGeneration(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-levels'] })
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: AcademicLevelType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        level: data.level,
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
        <Dialog.Title>កែប្រែកម្រិតសិក្សា</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            {/* Level Field - Now a Select Dropdown */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                កម្រិតសិក្សា
              </Text>
              <Controller
                control={control}
                name="level"
                rules={{ required: 'សូមជ្រើសរើសកម្រិតសិក្សា' }}
                render={({ field }) => (
                  <Select.Root
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <Select.Trigger
                      placeholder="ជ្រើសរើសកម្រិត..."
                      style={{ width: '100%' }}
                    />
                    <Select.Content>
                      <Select.Item value="Associate">Associate</Select.Item>
                      <Select.Item value="Bachelor">Bachelor</Select.Item>
                      <Select.Item value="Master">Master</Select.Item>
                      <Select.Item value="PhD">PhD</Select.Item>
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.level && (
                <Text size="2" color="red">
                  {errors.level.message}
                </Text>
              )}
            </label>

            {/* Description Field */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                ការពិពណ៌នា
              </Text>
              <TextField.Root
                {...register('description')}
                placeholder="បញ្ចូលការពិពណ៌នា"
              />
            </label>
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

export default GenerationUpdate

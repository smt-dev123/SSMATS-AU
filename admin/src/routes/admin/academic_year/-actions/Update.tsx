import { Button, Dialog, Flex, IconButton } from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import type { AcademicYearsType } from '@/types'
import { updateAcademicYear } from '@/api/AcademicYearAPI'
import { FormInput } from '@/components/ui/forms/Input'
import { FormCheckbox } from '@/components/ui/forms/Checkbox'

interface Props {
  data: AcademicYearsType
}

const formatDateForInput = (dateValue: string | Date | undefined) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const AcademicYearUpdate = ({ data }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<AcademicYearsType>({
    defaultValues: {
      ...data,
      startDate: formatDateForInput(data.startDate),
      endDate: formatDateForInput(data.endDate),
      isCurrent: data.isCurrent || false,
    },
  })

  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: AcademicYearsType) =>
      updateAcademicYear(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_years'] })
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: AcademicYearsType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      const formattedStart = formatDateForInput(data.startDate)
      reset({
        ...data,
        startDate: formattedStart,
        endDate: formatDateForInput(data.endDate),
        isCurrent: data.isCurrent || false,
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
        <Dialog.Title>កែប្រែឆ្នាំសិក្សា</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <FormInput
              label="ឆ្នាំសិក្សា"
              placeholder="សូមបំពេញឈ្មោះឆ្នាំសិក្សា"
              error={errors.name}
              register={register}
              name="name"
              rules={{
                required: 'សូមបំពេញឈ្មោះឆ្នាំសិក្សា',
                minLength: { value: 3, message: 'យ៉ាងហោចណាស់ ៣ខ្ទង់' },
              }}
              isRequired
            />

            <FormInput
              label="ថ្ងៃចាប់ផ្ដើម"
              placeholder="សូមបំពេញថ្ងៃចាប់ផ្ដើម"
              error={errors.startDate}
              register={register}
              name="startDate"
              type="date"
              rules={{
                required: 'សូមបំពេញថ្ងៃចាប់ផ្ដើម',
              }}
              isRequired
            />

            <FormInput
              label="ថ្ងៃបញ្ចប់"
              error={errors.endDate}
              register={register}
              name="endDate"
              type="date"
              rules={{
                required: 'សូមបំពេញថ្ងៃបញ្ចប់',
                validate: (val: string) =>
                  new Date(val) > new Date(getValues('startDate')) ||
                  'ថ្ងៃបញ្ចប់ត្រូវតែធំជាងថ្ងៃចាប់ផ្ដើម',
              }}
              isRequired
            />

            <FormCheckbox
              label="កំណត់ជាឆ្នាំសិក្សាបច្ចុប្បន្ន"
              name="isCurrent"
              control={control}
              placeholder="ឆ្នាំសិក្សាបច្ចុប្បន្ន"
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

export default AcademicYearUpdate

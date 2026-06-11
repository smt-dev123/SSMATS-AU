import { useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AcademicYearsType } from '@/types'
import { createAcademicYear } from '@/api/AcademicYearAPI'
import { FormInput } from '@/components/ui/forms/Input'
import { FormCheckbox } from '@/components/ui/forms/Checkbox'

const AcademicYearCreate = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<AcademicYearsType>({
    defaultValues: {
      isCurrent: false,
    },
  })
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: AcademicYearsType) => createAcademicYear(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_years'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: AcademicYearsType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមឆ្នាំសិក្សា
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>បន្ថែមឆ្នាំសិក្សា</Dialog.Title>

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
              placeholder="សូមបំពេញថ្ងៃបញ្ចប់"
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
            <Button type="submit">រក្សាទុក</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AcademicYearCreate

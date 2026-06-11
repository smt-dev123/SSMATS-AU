import { Button, Dialog, Flex, Grid, IconButton, Text } from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import type { SessionTimeType } from '@/types'
import { updateSessionTime } from '@/api/SessionTime'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'
import { FormCheckbox } from '@/components/ui/forms/Checkbox'

interface Props {
  data: SessionTimeType
}

const formatDateForInput = (dateString: string | undefined) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

const SessionTimeUpdate = ({ data }: Props) => {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<SessionTimeType>({
    defaultValues: {
      shift: data.shift,
      firstSessionStartTime: formatDateForInput(data.firstSessionStartTime),
      firstSessionEndTime: formatDateForInput(data.firstSessionEndTime),
      secondSessionStartTime: formatDateForInput(data.secondSessionStartTime),
      secondSessionEndTime: formatDateForInput(data.secondSessionEndTime),
      description: data.description,
      isActive: data.isActive,
    },
  })

  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const toMinutes = (timeStr: string | undefined) => {
    if (!timeStr) return 0
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const mutation = useMutation({
    mutationFn: (formData: SessionTimeType) =>
      updateSessionTime(Number(data.id), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session_times'] })
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: () => {
      toast.error('កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: SessionTimeType) => {
    mutation.mutate(formData)
  }

  useEffect(() => {
    if (open) {
      reset({
        shift: data.shift,
        firstSessionStartTime: formatDateForInput(data.firstSessionStartTime),
        firstSessionEndTime: formatDateForInput(data.firstSessionEndTime),
        secondSessionStartTime: formatDateForInput(data.secondSessionStartTime),
        secondSessionEndTime: formatDateForInput(data.secondSessionEndTime),
        description: data.description,
        isActive: data.isActive,
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
          <Flex direction="column" gap="4">
            {/* 1. Shift Selection (Enum) */}
            <FormSelect
              name="shift"
              control={control}
              register={register}
              label="វេនសិក្សា"
              placeholder="សូមជ្រើសរើសវេនសិក្សា"
              options={[
                { id: 'morning', name: 'Morning (ព្រឹក)' },
                { id: 'evening', name: 'Evening (រសៀល)' },
                { id: 'night', name: 'Night (យប់)' },
              ]}
              isRequired
              error={errors.shift}
            />

            {/* 2. Session 1 Times with Validation */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <Text size="2" weight="bold" mb="2" color="blue">
                ម៉ោងសិក្សាទី ១
              </Text>
              <Grid columns="2" gap="3">
                <FormInput
                  type="time"
                  name="firstSessionStartTime"
                  error={errors.firstSessionStartTime}
                  register={register}
                  rules={{
                    required: 'តម្រូវឱ្យបញ្ចូល',
                  }}
                  isRequired
                  label="ម៉ោងចាប់ផ្ដើម"
                />
                <FormInput
                  type="time"
                  name="firstSessionEndTime"
                  error={errors.firstSessionEndTime}
                  register={register}
                  rules={{
                    required: 'តម្រូវឱ្យបញ្ចូល',
                    validate: (val: string) =>
                      toMinutes(val) >
                        toMinutes(getValues('firstSessionStartTime')) ||
                      'ម៉ោងបញ្ចប់ត្រូវតែធំជាងម៉ោងចាប់ផ្ដើម',
                  }}
                  isRequired
                  label="ម៉ោងបញ្ចប់"
                />
              </Grid>
            </fieldset>

            {/* 3. Session 2 Times with Validation */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <Text size="2" weight="bold" mb="2" color="blue">
                ម៉ោងសិក្សាទី ២
              </Text>
              <Grid columns="2" gap="3">
                <FormInput
                  type="time"
                  name="secondSessionStartTime"
                  register={register}
                  rules={{
                    required: 'តម្រូវឱ្យបញ្ចូល',
                    validate: (val: string) =>
                      toMinutes(val) >
                        toMinutes(getValues('firstSessionEndTime')) ||
                      'ត្រូវចាប់ផ្ដើមក្រោយវេនទី ១ បញ្ចប់',
                  }}
                  isRequired
                  error={errors.secondSessionStartTime}
                  label="ម៉ោងចាប់ផ្ដើម"
                />
                <FormInput
                  type="time"
                  name="secondSessionEndTime"
                  register={register}
                  rules={{
                    required: 'តម្រូវឱ្យបញ្ចូល',
                    validate: (val: string) =>
                      toMinutes(val) >
                        toMinutes(getValues('secondSessionStartTime')) ||
                      'ម៉ោងបញ្ចប់ត្រូវតែធំជាងម៉ោងចាប់ផ្ដើម',
                  }}
                  isRequired
                  error={errors.secondSessionEndTime}
                  label="ម៉ោងបញ្ចប់"
                />
              </Grid>
            </fieldset>

            <FormInput
              type="text"
              name="description"
              register={register}
              error={errors.description}
              label="ការពិពណ៌នា"
              placeholder="ផ្សេងៗ..."
            />

            <FormCheckbox
              control={control}
              label="ស្ថានភាព"
              placeholder="សកម្ម (Active)"
              name="isActive"
              error={errors.isActive}
            />
          </Flex>

          <Flex gap="3" mt="5" justify="end">
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

export default SessionTimeUpdate

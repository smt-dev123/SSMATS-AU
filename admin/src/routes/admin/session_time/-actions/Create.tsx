import { useState } from 'react'
import { Button, Dialog, Flex, Text, Grid } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { SessionTimeType } from '@/types'
import { createSessionTime } from '@/api/SessionTime'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'

const toMinutes = (timeStr: string | undefined) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const SessionTimeCreate = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = useForm<SessionTimeType>()

  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: SessionTimeType) => createSessionTime(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session_times'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
      reset()
    },
    onError: (error: any) => {
      const data = error?.response?.data

      let issues: any[] = []
      try {
        if (
          data?.error?.name === 'ZodError' &&
          typeof data?.error?.message === 'string'
        ) {
          issues = JSON.parse(data.error.message)
        } else {
          issues = data?.error?.issues || data?.errors || []
        }
      } catch (e) {
        issues = []
      }

      if (Array.isArray(issues) && issues.length > 0) {
        issues.forEach((issue: any) => {
          const field = issue.path?.[0] || issue.field
          if (field) {
            setError(field as any, {
              type: 'server',
              message: issue.message,
            })
          }
        })
        toast.error('សូមពិនិត្យមើលព័ត៌មានដែលបានបញ្ចូលឡើងវិញ')
        return
      }

      const serverMsg = data?.message || 'បង្កើតមិនជោគជ័យ'
      toast.error(serverMsg)
    },
  })

  const onSubmit = (formData: SessionTimeType) => {
    // បង្កើត Object ថ្មីដោយបំប្លែងម៉ោងឲ្យមានវិនាទី (:00) ដើម្បីតម្រូវតាម Backend
    const payload = {
      ...formData,
      // ប្រសិនបើ formData មានវិនាទីហើយ វានឹងមិនបូកថែមទេ (ការពារ error ជាន់គ្នា)
      firstSessionStartTime:
        formData.firstSessionStartTime.includes(':') &&
        formData.firstSessionStartTime.split(':').length === 2
          ? `${formData.firstSessionStartTime}:00`
          : formData.firstSessionStartTime,

      firstSessionEndTime:
        formData.firstSessionEndTime.includes(':') &&
        formData.firstSessionEndTime.split(':').length === 2
          ? `${formData.firstSessionEndTime}:00`
          : formData.firstSessionEndTime,

      secondSessionStartTime:
        formData.secondSessionStartTime.includes(':') &&
        formData.secondSessionStartTime.split(':').length === 2
          ? `${formData.secondSessionStartTime}:00`
          : formData.secondSessionStartTime,

      secondSessionEndTime:
        formData.secondSessionEndTime.includes(':') &&
        formData.secondSessionEndTime.split(':').length === 2
          ? `${formData.secondSessionEndTime}:00`
          : formData.secondSessionEndTime,
    }

    mutation.mutate(payload)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមម៉ោងសិក្សា
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="500px"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>បន្ថែមម៉ោងសិក្សា</Dialog.Title>

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

export default SessionTimeCreate

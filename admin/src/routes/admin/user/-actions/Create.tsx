import { useState, useEffect } from 'react'
import { Button, Dialog, Flex, Grid } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { UsersType } from '@/types'
import { createUsers } from '@/api/UserAPI'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'

const UserCreate = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UsersType>({
    defaultValues: {
      role: 'staff',
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (formData: UsersType) => createUsers(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
    },
    onError: (error: any) => {
      const data = error?.response?.data
      const errorMessage = data?.message || ''

      if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('email')
      ) {
        setError('email', {
          type: 'server',
          message: 'អ៊ីម៉ែលនេះមានរួចហើយ សូមប្រើអ៊ីម៉ែលផ្សេង',
        })
        toast.error('អ៊ីម៉ែលនេះមានរួចហើយ')
        return
      }

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

      toast.error(data?.message || 'ការចុះឈ្មោះមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: UsersType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមអ្នកប្រើប្រាស់
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="500px"
        size="3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>បន្ថែមអ្នកប្រើប្រាស់ថ្មី</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Grid columns="1" gap="4">
              <FormInput
                register={register}
                control={control}
                label="ឈ្មោះ"
                name="name"
                placeholder="បញ្ចូលឈ្មោះ"
                rules={{
                  required: 'ត្រូវបញ្ចូលឈ្មោះ',
                }}
                error={errors.name}
                isRequired
              />

              <FormInput
                register={register}
                control={control}
                label="អ៊ីម៉ែល"
                placeholder="example@mail.com"
                error={errors.email}
                name="email"
                rules={{
                  required: 'សូមបំពេញអ៊ីម៉ែល',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'អ៊ីម៉ែលមិនត្រឹមត្រូវ',
                  },
                }}
                isRequired
              />

              <FormInput
                register={register}
                control={control}
                label="ពាក្យសម្ងាត់"
                placeholder="********"
                error={errors.password}
                name="password"
                rules={{
                  required: 'សូមបំពេញពាក្យសម្ងាត់',
                  minLength: {
                    value: 6,
                    message: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ',
                  },
                }}
                type="password"
                isRequired
              />

              <FormSelect
                register={register}
                control={control}
                label="តួនាទី"
                name="role"
                placeholder="ជ្រើសរើសតួនាទី"
                options={[
                  { id: 'manager', name: 'អ្នកគ្រប់គ្រង (Manager)' },
                  { id: 'staff', name: 'បុគ្គលិក (Staff)' },
                ]}
                rules={{
                  required: 'ត្រូវជ្រើសរើសតួនាទី',
                }}
                error={errors.role}
                isRequired
              />
            </Grid>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                type="button"
                style={{ cursor: 'pointer' }}
              >
                ចាកចេញ
              </Button>
            </Dialog.Close>
            <Button
              type="submit"
              loading={mutation.isPending}
              style={{ cursor: 'pointer' }}
            >
              រក្សាទុក
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default UserCreate

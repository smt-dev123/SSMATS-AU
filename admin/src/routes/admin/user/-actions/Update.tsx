import { useState, useEffect } from 'react'
import { Button, Dialog, Flex, Grid, IconButton } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { UsersType } from '@/types'
import { updateUsers } from '@/api/UserAPI'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'
import { FaRegEdit } from 'react-icons/fa'

interface Props {
  user: UsersType
}

const UserUpdate = ({ user }: Props) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    control,
    register,
    handleSubmit,

    reset,
    formState: { errors },
  } = useForm<UsersType>({
    defaultValues: user,
  })

  useEffect(() => {
    if (open) {
      reset(user)
    }
  }, [open, reset, user])

  const mutation = useMutation({
    mutationFn: (formData: UsersType) => updateUsers(user.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('ធ្វើបច្ចុប្បន្នភាពជោគជ័យ')
      setOpen(false)
    },
    onError: (error: any) => {
      const data = error?.response?.data
      toast.error(data?.message || 'ធ្វើបច្ចុប្បន្នភាពមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: UsersType) => {
    mutation.mutate(formData)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton
          size="1"
          color="cyan"
          variant="surface"
          style={{ cursor: 'pointer' }}
        >
          <FaRegEdit />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="500px"
        size="3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>ធ្វើបច្ចុប្បន្នភាពអ្នកប្រើប្រាស់</Dialog.Title>

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
                }}
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
              កែប្រែ
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default UserUpdate

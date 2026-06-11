import { useState } from 'react'
import { Button, Dialog, Flex, Grid, IconButton } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { UsersType } from '@/types'
import { FormInput } from '@/components/ui/forms/Input'
import { FaLock } from 'react-icons/fa'
import { admin } from '@/lib/auth-client'

interface Props {
  user: UsersType
}

const ChangePassword = ({ user }: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
    },
  })

  const onSubmit = async (formData: { newPassword: string }) => {
    setLoading(true)
    try {
      const { error } = await admin.setUserPassword({
        userId: user.id,
        newPassword: formData.newPassword,
      })

      if (error) {
        toast.error(error.message || 'បរាជ័យក្នុងការប្ដូរលេខកូដសម្ងាត់')
      } else {
        toast.success('លេខកូដសម្ងាត់ត្រូវបានប្ដូរដោយជោគជ័យ')
        setOpen(false)
        reset()
      }
    } catch (e: any) {
      toast.error('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) reset()
    }}>
      <Dialog.Trigger>
        <IconButton
          size="1"
          color="orange"
          variant="surface"
          style={{ cursor: 'pointer' }}
          title="កំណត់លេខកូដសម្ងាត់ថ្មី"
        >
          <FaLock />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="400px"
        size="3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>ប្ដូរលេខកូដសម្ងាត់ (Reset Password)</Dialog.Title>
        <Dialog.Description size="2" mb="4" color="gray">
          កំណត់លេខកូដសម្ងាត់ថ្មីសម្រាប់អ្នកប្រើប្រាស់ <b>{user.name}</b>
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Grid columns="1" gap="4">
              <FormInput
                register={register}
                control={control}
                label="លេខកូដសម្ងាត់ថ្មី"
                name="newPassword"
                type="password"
                placeholder="បញ្ចូលលេខកូដថ្មី (យ៉ាងតិច 6 ខ្ទង់)"
                rules={{
                  required: 'ត្រូវបញ្ចូលលេខកូដថ្មី',
                  minLength: {
                    value: 6,
                    message: 'លេខកូដត្រូវមានយ៉ាងហោចណាស់ 6 ខ្ទង់'
                  }
                }}
                error={errors.newPassword as any}
                isRequired
              />
            </Grid>
          </Flex>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                type="button"
                style={{ cursor: 'pointer' }}
                disabled={loading}
              >
                ចាកចេញ
              </Button>
            </Dialog.Close>
            <Button
              type="submit"
              loading={loading}
              color="orange"
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

export default ChangePassword

import { Box, Button, Flex, Separator, Text, TextField } from '@radix-ui/themes'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'

interface SecurityTabProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  onSubmit: (data: any) => Promise<void>
  isUpdating: boolean
  newPasswordValue: string
}

export function SecurityTab({
  register,
  errors,
  onSubmit,
  isUpdating,
  newPasswordValue,
}: SecurityTabProps) {
  return (
    <Flex direction="column" gap="4">
      <Text size="4" weight="bold">
        ប្តូរលេខសម្ងាត់
      </Text>
      <Separator size="4" my="1" />
      <Box maxWidth="400px">
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                លេខសម្ងាត់ចាស់ <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                type="password"
                {...register('currentPassword', {
                  required: 'សូមបញ្ចូលលេខសម្ងាត់ចាស់',
                })}
                placeholder="••••••••"
              />
              {errors.currentPassword && (
                <Text size="1" color="red">
                  {errors.currentPassword.message as string}
                </Text>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                លេខសម្ងាត់ថ្មី <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                type="password"
                {...register('newPassword', {
                  required: 'សូមបញ្ចូលលេខសម្ងាត់ថ្មី',
                  minLength: { value: 8, message: 'យ៉ាងតិច 8 ខ្ទង់' },
                })}
                placeholder="••••••••"
              />
              {errors.newPassword && (
                <Text size="1" color="red">
                  {errors.newPassword.message as string}
                </Text>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                បញ្ជាក់លេខសម្ងាត់ថ្មី <span className="text-red-500">*</span>
              </Text>
              <TextField.Root
                type="password"
                {...register('confirmPassword', {
                  required: 'សូមបញ្ជាក់លេខសម្ងាត់ថ្មី',
                  validate: (val) =>
                    val === newPasswordValue || 'លេខសម្ងាត់មិនត្រូវគ្នា',
                })}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <Text size="1" color="red">
                  {errors.confirmPassword.message as string}
                </Text>
              )}
            </Box>

            <Button
              type="submit"
              mt="2"
              loading={isUpdating}
              variant="outline"
              style={{ width: 'fit-content', cursor: 'pointer' }}
            >
              ធ្វើបច្ចុប្បន្នភាពលេខសម្ងាត់
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  )
}

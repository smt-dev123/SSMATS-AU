import { Box, Checkbox, Flex, Text } from '@radix-ui/themes'
import { Controller, type Control } from 'react-hook-form'

interface FormCheckboxProps {
  label: string
  name: string
  placeholder?: string
  control: Control<any>
  isRequired?: boolean
  rules?: object
  error?: any
}

export const FormCheckbox = ({
  label,
  name,
  placeholder,
  control,
  rules,
  isRequired = false,
  error,
}: FormCheckboxProps) => (
  <Box mb="2">
    <Text as="div" size="2" mb="1" weight="bold" color="gray">
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Text>
    <Controller
      name={name}
      control={control}
      rules={{ required: isRequired, ...rules }}
      render={({ field }) => (
        <Flex gap="2" align="center">
          <Checkbox
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            size="2"
          />
          <Text
            as="label"
            size="2"
            htmlFor={name}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {placeholder}
          </Text>
        </Flex>
      )}
    />
    {error && (
      <Text size="1" color="red" mt="1">
        {error.message || 'សូមជ្រើសរើសព័ត៌មាននេះ'}
      </Text>
    )}
  </Box>
)

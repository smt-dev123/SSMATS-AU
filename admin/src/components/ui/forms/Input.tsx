import { Box, Text, TextField, Select, TextArea } from '@radix-ui/themes'
import {
  Controller,
  type FieldError,
  type UseFormRegister,
  type Control,
} from 'react-hook-form'

interface BaseProps {
  label: string
  name: string
  placeholder?: string
  error?: FieldError
  isRequired?: boolean
  register?: UseFormRegister<any>
  control?: Control<any>
}

interface InputProps extends BaseProps {
  register: UseFormRegister<any>
  type?:
    | 'number'
    | 'text'
    | 'search'
    | 'time'
    | 'hidden'
    | 'tel'
    | 'url'
    | 'email'
    | 'date'
    | 'datetime-local'
    | 'month'
    | 'password'
    | 'week'
    | undefined
  rules?: object
  min?: number
  max?: number
}

interface SelectProps extends BaseProps {
  control: Control<any>
  options: { [key: string]: any }[]
  disabled?: boolean
  disabledOptions?: string[]
  labelKey?: string
  valueKey?: string
  rules?: object
  valueAsNumber?: boolean
}

interface TextAreaProps extends InputProps {
  rows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  variant?: 'classic' | 'surface' | 'soft'
}

export const FormInput = ({
  label,
  name,
  placeholder,
  register,
  type = 'text',
  rules,
  error,
  isRequired = false,
  min,
  max,
}: InputProps) => (
  <Box mb="2">
    <Text as="div" size="2" mb="1" weight="bold" color="gray">
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Text>
    <TextField.Root
      type={type}
      placeholder={placeholder}
      {...register(name, { valueAsNumber: type === 'number', ...rules })}
      min={min}
      max={max}
      size="2"
    />
    {error && (
      <Text size="1" color="red" mt="1">
        {error.message || 'សូមបញ្ចូលព័ត៌មាននេះ'}
      </Text>
    )}
  </Box>
)

export const FormSelect = ({
  label,
  name,
  control,
  options,
  placeholder,
  disabled,
  disabledOptions = [],
  labelKey = 'name',
  valueKey = 'id',
  isRequired = false,
  rules,
  valueAsNumber = false,
  error,
}: SelectProps) => (
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
        <Select.Root
          disabled={disabled}
          value={
            field.value !== undefined && field.value !== null
              ? String(field.value)
              : undefined
          }
          onValueChange={(val) =>
            field.onChange(valueAsNumber ? Number(val) : val)
          }
        >
          <Select.Trigger placeholder={placeholder} style={{ width: '100%' }} />
          <Select.Content>
            {options.map((opt, index) => (
              <Select.Item
                key={opt[valueKey] || index}
                value={String(opt[valueKey])}
                disabled={
                  disabledOptions.includes(String(opt[valueKey])) &&
                  String(field.value) !== String(opt[valueKey])
                }
              >
                {opt[labelKey]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
    />
    {error && (
      <Text size="1" color="red" mt="1">
        {error.message || 'សូមជ្រើសរើសព័ត៌មាននេះ'}
      </Text>
    )}
  </Box>
)

export const FormTextArea = ({
  label,
  name,
  placeholder,
  register,
  rules,
  error,
  rows = 3,
  resize = 'vertical',
  variant = 'surface',
  isRequired = false,
}: TextAreaProps) => (
  <Box mb="2">
    <Text as="div" size="2" mb="1" weight="bold" color="gray">
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Text>
    <TextArea
      {...register(name, { ...rules })}
      placeholder={placeholder}
      rows={rows}
      resize={resize}
      variant={variant}
      size="3"
    />
    {error && (
      <Text size="1" color="red" mt="1">
        {error.message || 'សូមបញ្ចូលព័ត៌មាននេះ'}
      </Text>
    )}
  </Box>
)

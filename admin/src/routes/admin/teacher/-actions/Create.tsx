import {  useEffect, useState } from 'react'
import { Avatar, Box, Button, Dialog, Flex, Grid, Text } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type {ChangeEvent} from 'react';
import type { TeachersType } from '@/types'
import { createTeachers } from '@/api/TeacherAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { getFaculties } from '@/api/FacultyAPI'
import {
  FormInput,
  FormSelect,
  FormTextArea,
} from '@/components/ui/forms/Input'

const TeacherCreate = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm<TeachersType>({
    defaultValues: {
      name: '',
      nameEn: '',
      gender: 'male',
      academicLevelId: undefined,
      facultyId: undefined,
    },
  })

  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: getAcademicLevels,
  })

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024)

      if (fileSizeInMB > 1) {
        toast.error('រូបភាពមិនអាចធំជាង 1MB ឡើយ!')
        e.target.value = ''
        setImageFile(null)
        setPreviewUrl(null)
        return
      }

      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    if (!open) {
      reset()
      setImageFile(null)
      setPreviewUrl(null)
    }
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (formData: any) => createTeachers(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('បង្កើតជោគជ័យ')
      setOpen(false)
    },
    onError: (error: any) => {
      const data = error?.response?.data
      if (data?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setError('email', {
          type: 'manual',
          message:
            'អ៊ីម៉ែលនេះមានអ្នកប្រើប្រាស់រួចហើយ សូមប្រើប្រាស់អ៊ីម៉ែលផ្សេង',
        })
        return
      }

      let issues: Array<any> = []
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
            setError(field, {
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

  const onSubmit = (formData: TeachersType) => {
    const data = new FormData()
    if (imageFile) {
      data.append('image', imageFile)
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        data.append(key, String(value))
      }
    })

    mutation.mutate(data)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" style={{ cursor: 'pointer' }}>
          បន្ថែមគ្រូ
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="700px"
        size="3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>បន្ថែមគ្រូថ្មី</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Flex
              align="center"
              gap="4"
              p="3"
              style={{
                border: '1px dashed var(--gray-6)',
                borderRadius: '8px',
              }}
            >
              <Avatar
                size="6"
                src={previewUrl || ''}
                fallback={watch('name')?.charAt(0) || 'S'}
                radius="full"
              />
              <Box>
                <Text as="div" size="2" mb="2" weight="bold">
                  រូបថតគ្រូ (Profile Picture)
                </Text>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </Box>
            </Flex>

            <Grid columns={{ initial: '1', md: '2' }} gap="4">
              <FormInput
                register={register}
                control={control}
                label="អត្តលេខគ្រូ (ID)"
                name="teacherCode"
                placeholder="ឧ. T-001"
                rules={{
                  required: 'ត្រូវបញ្ចូលអត្តលេខគ្រូ',
                  pattern: {
                    value: /^[A-Z0-9-]+$/,
                    message:
                      'អត្តលេខគ្រូមិនត្រឹមត្រូវ (អនុញ្ញាតតែអក្សរធំ លេខ និង -)',
                  },
                }}
                error={errors.teacherCode}
                isRequired
              />

              <FormInput
                register={register}
                control={control}
                label="គោត្តនាម-នាម"
                name="name"
                placeholder="បញ្ចូលឈ្មោះ"
                rules={{
                  required: 'ត្រូវបញ្ចូលឈ្មោះ',
                }}
                error={errors.name}
                isRequired
              />

              <FormInput
                label="ឈ្មោះអង់គ្លេស"
                placeholder="Teacher Name"
                name="nameEn"
                control={control}
                register={register}
                error={errors.nameEn}
                rules={{
                  required: 'ត្រូវបញ្ចូលឈ្មោះអង់គ្លេស',
                  pattern: {
                    value: /^[a-zA-Z ]+$/,
                    message: 'ឈ្មោះអង់គ្លេសត្រូវមានតែអក្សរ a-z A-Z និង space',
                  },
                }}
                isRequired
              />

              {/* Gender */}
              <FormSelect
                register={register}
                control={control}
                label="ភេទ"
                name="gender"
                placeholder="ជ្រើសរើសភេទ"
                options={[
                  { id: 'male', name: 'ប្រុស (Male)' },
                  { id: 'female', name: 'ស្រី (Female)' },
                ]}
                rules={{
                  required: 'ត្រូវជ្រើសរើសភេទ',
                }}
                error={errors.gender}
                isRequired
              />

              <FormSelect
                register={register}
                control={control}
                label="កម្រិតវប្បធម៌"
                name="academicLevelId"
                placeholder="ជ្រើសរើសកម្រិតវប្បធម៌"
                options={academicLevels.map((level) => ({
                  id: level.id,
                  name: level.level,
                }))}
                rules={{
                  required: 'ត្រូវជ្រើសរើសកម្រិតវប្បធម៌',
                }}
                error={errors.academicLevelId}
                isRequired
                valueAsNumber
              />

              <FormSelect
                register={register}
                control={control}
                label="មហាវិទ្យាល័យ"
                name="facultyId"
                placeholder="សូមជ្រើសរើសមហាវិទ្យាល័យ"
                options={faculties ?? []}
                rules={{
                  required: 'សូមជ្រើសរើសមហាវិទ្យាល័យ',
                }}
                error={errors.facultyId}
                isRequired
                labelKey="name"
                valueKey="id"
                valueAsNumber
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

              <FormInput
                register={register}
                control={control}
                label="លេខទូរស័ព្ទ"
                placeholder="012 345 678"
                error={errors.phone}
                name="phone"
                min={9}
                max={12}
                rules={{
                  required: 'សូមបំពេញលេខទូរស័ព្ទ',
                  pattern: {
                    value: /^[0-9+ ]+$/,
                    message: 'លេខទូរស័ព្ទត្រូវមានតែលេខ 0-9 និង ដកឃ្លា',
                  },
                }}
                type="tel"
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
            </Grid>
            <FormTextArea
              register={register}
              control={control}
              label="អាសយដ្ឋាន"
              name="address"
              placeholder="សូមបំពេញអាសយដ្ឋាន (មិនទាមទារ)"
              error={errors.address}
              rows={3}
              resize="vertical"
            />
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

export default TeacherCreate

import { useState, useEffect, type ChangeEvent } from 'react'
import {
  Button,
  Dialog,
  Flex,
  Text,
  Grid,
  Box,
  IconButton,
  Avatar,
} from '@radix-ui/themes'
import { FaRegEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { TeachersType } from '@/types'
import { getFaculties } from '@/api/FacultyAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { updateTeachers } from '@/api/TeacherAPI'
import {
  FormInput,
  FormSelect,
  FormTextArea,
} from '@/components/ui/forms/Input'
import { FormCheckbox } from '@/components/ui/forms/Checkbox'

interface Props {
  data: TeachersType
}

const TeacherUpdate = ({ data }: Props) => {
  const [open, setOpen] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TeachersType>()

  // Fetch Options
  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })
  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: getAcademicLevels,
  })

  useEffect(() => {
    if (open && data) {
      reset({
        ...data,
        gender: data.gender || '',
        academicLevelId: data.academicLevelId,
        facultyId: data.facultyId,
      })
      if (data.image || (data as any).image) {
        setPreviewUrl(
          data.image
            ? `http://localhost:3000/api/uploads/${data.image}`
            : `http://localhost:3000/api/uploads/${(data as any).image}`,
        )
      } else {
        setPreviewUrl(null)
      }
      setImageFile(null)
    }
  }, [open, data, reset])

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

  const mutation = useMutation({
    mutationFn: (formData: any) => updateTeachers(String(data.id!), formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('កែប្រែជោគជ័យ')
      setOpen(false)
    },
    onError: () => toast.error('កែប្រែមិនជោគជ័យ'),
  })

  const onSubmit = (formData: TeachersType) => {
    const payload = new FormData()
    payload.append('name', formData.name)
    payload.append('nameEn', formData.nameEn)
    payload.append('gender', formData.gender)
    payload.append('email', formData.email)
    payload.append('phone', formData.phone || '')
    payload.append('academicLevelId', String(formData.academicLevelId))
    payload.append('facultyId', String(formData.facultyId))
    if (formData.teacherCode)
      payload.append('teacherCode', formData.teacherCode)
    if (formData.password) payload.append('password', formData.password)
    if (formData.address) payload.append('address', formData.address)
    payload.append('isActive', String(formData.isActive))
    if (imageFile) payload.append('image', imageFile)

    mutation.mutate(payload)
  }

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

      <Dialog.Content maxWidth="700px" size="3">
        <Dialog.Title>កែប្រែព័ត៌មានគ្រូបង្រៀន</Dialog.Title>

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
                fallback={watch('name')?.charAt(0) || 'T'}
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
            </Grid>

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

            <FormCheckbox
              control={control}
              label="ស្ថានភាព"
              placeholder="សកម្ម (Active)"
              name="isActive"
              error={errors.isActive}
            />
          </Flex>

          <Flex gap="3" mt="6" justify="end">
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
              រក្សាទុកការផ្លាស់ប្តូរ
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default TeacherUpdate

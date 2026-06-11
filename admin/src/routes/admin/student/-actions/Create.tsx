import { useState, useEffect, type ChangeEvent } from 'react'
import { Button, Dialog, Flex, Text, Grid, Box, Avatar } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { StudentsType } from '@/types'
import { createStudent } from '@/api/StudentAPI'
import { getFaculties } from '@/api/FacultyAPI'
import { getDepartments } from '@/api/DepartmentAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { getAcademicYear } from '@/api/AcademicYearAPI'
import { getMajors } from '@/api/MajorAPI'
import { FormInput, FormSelect } from '@/components/ui/forms/Input'

const StudentCreate = () => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) // បន្ថែម state សម្រាប់គ្រប់គ្រង Step
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    watch,
    trigger, // ប្រើប្រាស់សម្រាប់ Validate មុនពេលទៅ Step បន្ទាប់
    formState: { errors },
  } = useForm<StudentsType>({
    defaultValues: {
      name: '',
      nameEn: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      gender: 'male',
      educationalStatus: 'enrolled',
      academicYearId: 1,
    },
  })

  const facultyId = watch('facultyId')

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })
  const { data: majors = [] } = useQuery({
    queryKey: ['majors', facultyId],
    queryFn: () => getMajors(),
  })
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', facultyId],
    queryFn: () => getDepartments(),
  })
  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: getAcademicLevels,
  })
  const { data: academicYearsRes } = useQuery({
    queryKey: ['academicYears'],
    queryFn: getAcademicYear,
  })
  const academicYears = academicYearsRes || []

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

  // សំអាតទិន្នន័យពេលបើក Dialog ម្តងៗ
  useEffect(() => {
    if (open) {
      reset()
      setStep(1) // ត្រឡប់ទៅ step 1 វិញរាល់ពេលបើកផ្ទាំង popup
      setImageFile(null)
      setPreviewUrl(null)
      if (academicYears.length > 0) {
        const currentYear = academicYears.find((ay: any) => ay.isCurrent)
        const latestYear =
          currentYear || [...academicYears].sort((a, b) => b.id - a.id)[0]
        if (latestYear) {
          setValue('academicYearId', latestYear.id.toString())
          setValue('year', 1)
          setValue('semester', 1)
        }
      }
    }
  }, [open, reset, academicYears, setValue])

  // Reset តម្លៃនៅពេលប្តូរមហាវិទ្យាល័យ
  useEffect(() => {
    if (facultyId) {
      setValue('departmentId', 0)
      setValue('skillId', 0)
    }
  }, [facultyId, setValue])

  // មុខងារសម្រាប់ទៅកាន់ Step បន្ទាប់ (មានការ Check Validation)
  const handleNextStep = async () => {
    let fieldsToValidate: any[] = []

    if (step === 1) {
      fieldsToValidate = [
        'studentCode',
        'name',
        'nameEn',
        'gender',
        'email',
        'phone',
        'dob',
      ]
    } else if (step === 2) {
      fieldsToValidate = [
        'academicYearId',
        'academicLevelId',
        'facultyId',
        'skillId',
        'departmentId',
        'year',
        'semester',
        'generation',
      ]
    }

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) {
      setStep((prev) => prev + 1)
    } else {
      toast.error('សូមបំពេញព័ត៌មានដែលចាំបាច់ឱ្យបានត្រឹមត្រូវ!')
    }
  }

  // មុខងារថយក្រោយ
  const handleBackStep = () => {
    setStep((prev) => prev - 1)
  }

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createStudent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('ចុះឈ្មោះនិស្សិតបានជោគជ័យ')
      setOpen(false)
    },
    onError: (error: any) => {
      const data = error?.response?.data
      if (data?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setStep(1) // ត្រឡប់ទៅ step 1 ព្រោះអ៊ីម៉ែលនៅ step 1
        setError('email', {
          type: 'manual',
          message:
            'អ៊ីម៉ែលនេះមានអ្នកប្រើប្រាស់រួចហើយ សូមប្រើប្រាស់អ៊ីម៉ែលផ្សេង',
        })
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
            setError(field as any, { type: 'server', message: issue.message })
          }
        })
        toast.error('សូមពិនិត្យមើលព័ត៌មានដែលបានបញ្ចូលឡើងវិញ')
        return
      }
      toast.error(data?.message || 'ការចុះឈ្មោះមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: StudentsType) => {
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
        <Button variant="solid" color="indigo" style={{ cursor: 'pointer' }}>
          + បន្ថែមនិស្សិតថ្មី
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="750px"
        size="3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Dialog.Title>ចុះឈ្មោះនិស្សិតថ្មី</Dialog.Title>
        <Dialog.Description size="2" mb="4" color="gray">
          ជំហានទី {step} នៃ 3: សូមបំពេញព័ត៌មានផ្នែកខាងក្រោម។
        </Dialog.Description>

        {/* បង្ហាញរបារ Step Progress */}
        <Flex gap="2" mb="4" width="100%">
          <Box
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: step >= 1 ? 'var(--indigo-9)' : 'var(--gray-4)',
              borderRadius: '2px',
            }}
          />
          <Box
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: step >= 2 ? 'var(--indigo-9)' : 'var(--gray-4)',
              borderRadius: '2px',
            }}
          />
          <Box
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: step >= 3 ? 'var(--indigo-9)' : 'var(--gray-4)',
              borderRadius: '2px',
            }}
          />
        </Flex>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            {/* ================= STEP 1: ព័ត៌មានផ្ទាល់ខ្លួន ================= */}
            {step === 1 && (
              <>
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
                      រូបថតនិស្សិត (Profile Picture)
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
                    label="លេខសម្គាល់"
                    name="studentCode"
                    placeholder="សូមបំពេញលេខសម្គាល់"
                    control={control}
                    register={register}
                    error={errors.studentCode}
                    rules={{ required: 'ត្រូវបញ្ចូលលេខសម្គាល់' }}
                    isRequired
                  />
                  <FormInput
                    label="ឈ្មោះនិស្សិត"
                    name="name"
                    placeholder="ឈ្មោះនិស្សិត"
                    control={control}
                    register={register}
                    error={errors.name}
                    rules={{
                      required: 'ត្រូវបញ្ចូលឈ្មោះនិស្សិត',
                      pattern: {
                        value: /^[\u1780-\u17FF\s]+$/,
                        message: 'ឈ្មោះនិស្សិតត្រូវមានតែអក្សរខ្មែរ និង space',
                      },
                    }}
                    isRequired
                  />
                  <FormInput
                    label="ឈ្មោះអង់គ្លេស"
                    placeholder="Student Name"
                    name="nameEn"
                    control={control}
                    register={register}
                    error={errors.nameEn}
                    rules={{
                      required: 'ត្រូវបញ្ចូលឈ្មោះអង់គ្លេស',
                      pattern: {
                        value: /^[a-zA-Z ]+$/,
                        message:
                          'ឈ្មោះអង់គ្លេសត្រូវមានតែអក្សរ a-z A-Z និង space',
                      },
                    }}
                    isRequired
                  />
                  <FormSelect
                    label="ភេទ"
                    name="gender"
                    control={control}
                    register={register}
                    error={errors.gender}
                    isRequired
                    rules={{ required: 'ត្រូវជ្រើសរើសភេទ' }}
                    options={[
                      { id: 'male', name: 'ប្រុស' },
                      { id: 'female', name: 'ស្រី' },
                    ]}
                  />
                  <FormInput
                    label="អ៊ីម៉ែល"
                    placeholder="student@example.com"
                    name="email"
                    control={control}
                    register={register}
                    error={errors.email}
                    rules={{
                      required: 'ត្រូវបញ្ចូលអ៊ីម៉ែល',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'អ៊ីម៉ែលមិនត្រឹមត្រូវ',
                      },
                    }}
                    isRequired
                  />
                  <FormInput
                    label="លេខទូរស័ព្ទ"
                    placeholder="012 345 678"
                    name="phone"
                    control={control}
                    register={register}
                    error={errors.phone}
                    type="tel"
                    rules={{
                      required: 'ត្រូវបញ្ចូលលេខទូរស័ព្ទ',
                      pattern: {
                        value: /^[0-9+ ]+$/,
                        message: 'លេខទូរស័ព្ទត្រូវមានតែលេខ 0-9 និង ដកឃ្លា',
                      },
                    }}
                    isRequired
                  />
                  <FormInput
                    label="ថ្ងៃខែឆ្នាំកំណើត"
                    name="dob"
                    control={control}
                    register={register}
                    rules={{ required: 'ត្រូវជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត' }}
                    type="date"
                    error={errors.dob}
                    isRequired
                  />
                  <FormInput
                    label="អាស័យដ្ឋាន"
                    placeholder="សូមបំពេញអាស័យដ្ឋាន"
                    name="address"
                    control={control}
                    register={register}
                    error={errors.address}
                  />
                </Grid>
              </>
            )}

            {/* ================= STEP 2: ព័ត៌មានសិក្សាជំនាញ ================= */}
            {step === 2 && (
              <Grid columns={{ initial: '1', md: '2' }} gap="4">
                <FormSelect
                  label="ឆ្នាំសិក្សា"
                  placeholder="សូមជ្រើសរើសឆ្នាំសិក្សា"
                  name="academicYearId"
                  control={control}
                  register={register}
                  error={errors.academicYearId}
                  isRequired
                  options={academicYears ?? []}
                  rules={{ required: 'ត្រូវជ្រើសរើសឆ្នាំសិក្សា' }}
                  valueAsNumber
                  labelKey="name"
                  valueKey="id"
                />
                <FormSelect
                  label="កម្រិតសិក្សា"
                  placeholder="សូមជ្រើសរើសកម្រិតសិក្សា"
                  name="academicLevelId"
                  control={control}
                  register={register}
                  error={errors.academicLevelId}
                  isRequired
                  options={academicLevels ?? []}
                  rules={{ required: 'ត្រូវជ្រើសរើសកម្រិតសិក្សា' }}
                  valueAsNumber
                  labelKey="level"
                  valueKey="id"
                />
                <FormSelect
                  label="មហាវិទ្យាល័យ"
                  placeholder="សូមជ្រើសរើសមហាវិទ្យាល័យ"
                  name="facultyId"
                  control={control}
                  register={register}
                  error={errors.facultyId}
                  isRequired
                  options={faculties ?? []}
                  rules={{ required: 'ត្រូវជ្រើសរើសមហាវិទ្យាល័យ' }}
                  valueAsNumber
                  labelKey="name"
                  valueKey="id"
                />
                <FormSelect
                  label="ជំនាញ"
                  name="skillId"
                  control={control}
                  register={register}
                  error={errors.skillId}
                  placeholder={
                    facultyId ? 'ជ្រើសរើសជំនាញ' : 'សូមជ្រើសរើសមហាវិទ្យាល័យជាមុន'
                  }
                  isRequired
                  options={majors
                    .filter(
                      (m: any) =>
                        m.facultyId?.toString() === facultyId?.toString(),
                    )
                    .map((m: any) => ({ id: m.id, name: m.name }))}
                  rules={{ required: 'ត្រូវជ្រើសរើសជំនាញ' }}
                  valueAsNumber
                  labelKey="name"
                  valueKey="id"
                />
                <FormSelect
                  label="តេប៉ាតឺម៉ង់"
                  name="departmentId"
                  control={control}
                  register={register}
                  error={errors.departmentId}
                  isRequired
                  placeholder={
                    facultyId
                      ? 'ជ្រើសរើសតេប៉ាតឺម៉ង់'
                      : 'សូមជ្រើសរើសមហាវិទ្យាល័យជាមុន'
                  }
                  options={departments
                    .filter(
                      (d: any) =>
                        d.facultyId?.toString() === facultyId?.toString(),
                    )
                    .map((d: any) => ({ id: d.id, name: d.name }))}
                  rules={{ required: 'ត្រូវជ្រើសរើសតេប៉ាតឺម៉ង់' }}
                  valueAsNumber
                  labelKey="name"
                  valueKey="id"
                />
                <FormInput
                  label="ឆ្នាំទី"
                  name="year"
                  control={control}
                  register={register}
                  type="number"
                  error={errors.year}
                  placeholder="សូមជ្រើសរើសឆ្នាំទី"
                  isRequired
                  rules={{
                    required: 'ត្រូវបញ្ចូលឆ្នាំទី',
                    min: { value: 1, message: 'ឆ្នាំទីត្រូវចាប់ពី ១' },
                    max: { value: 5, message: 'ឆ្នាំទីត្រឹម ៥' },
                  }}
                />
                <FormInput
                  label="ឆមាស"
                  name="semester"
                  control={control}
                  register={register}
                  type="number"
                  error={errors.semester}
                  placeholder="សូមជ្រើសរើសឆមាស"
                  isRequired
                  rules={{
                    required: 'ត្រូវបញ្ចូលឆមាស',
                    min: { value: 1, message: 'ឆមាសត្រូវចាប់ពី ១' },
                    max: { value: 2, message: 'ឆមាសត្រឹម ២' },
                  }}
                />
                <FormInput
                  label="ជំនាន់"
                  name="generation"
                  control={control}
                  register={register}
                  type="number"
                  error={errors.generation}
                  placeholder="សូមជ្រើសរើសជំនាន់"
                  isRequired
                  rules={{
                    required: 'ត្រូវជ្រើសរើសជំនាន់',
                    min: { value: 1, message: 'ជំនាន់ត្រូវចាប់ពី ១' },
                  }}
                />
              </Grid>
            )}

            {/* ================= STEP 3: បង្កើតលេខសម្ងាត់ប្រព័ន្ធ ================= */}
            {step === 3 && (
              <Box
                p="4"
                style={{
                  border: '1px solid var(--gray-5)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--gray-2)',
                }}
              >
                <Text size="3" weight="bold" as="div" mb="3">
                  បង្កើតគណនីចូលប្រើប្រាស់
                </Text>
                <FormInput
                  label="លេខសម្ងាត់សម្រាប់គណនីនិស្សិត"
                  name="password"
                  control={control}
                  register={register}
                  type="password"
                  error={errors.password}
                  placeholder="សូមបំពេញលេខសម្ងាត់យ៉ាងតិច ៨ តួ"
                  isRequired
                  rules={{
                    required: 'ត្រូវបញ្ចូលលេខសម្ងាត់',
                    minLength: {
                      value: 8,
                      message: 'លេខសម្ងាត់ត្រូវមានយ៉ាងតិច 8 តួអក្សរ',
                    },
                  }}
                />
              </Box>
            )}

            {/* ================= BUTTON CONTROLS ================= */}
            <Flex gap="3" mt="4" justify="end">
              {step === 1 ? (
                <Dialog.Close>
                  <Button
                    variant="soft"
                    color="gray"
                    type="button"
                    style={{ cursor: 'pointer' }}
                  >
                    បោះបង់
                  </Button>
                </Dialog.Close>
              ) : (
                <Button
                  variant="soft"
                  color="gray"
                  type="button"
                  onClick={handleBackStep}
                  style={{ cursor: 'pointer' }}
                >
                  ថយក្រោយ
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  color="indigo"
                  onClick={handleNextStep}
                  style={{ cursor: 'pointer' }}
                >
                  បន្ទាប់
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={mutation.isPending}
                  style={{ cursor: 'pointer' }}
                >
                  ចុះឈ្មោះនិស្សិត
                </Button>
              )}
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default StudentCreate

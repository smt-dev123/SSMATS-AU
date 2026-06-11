import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  Flex,
  Text,
  Grid,
  Box,
  Badge,
  IconButton,
} from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { IoArrowUpCircle } from 'react-icons/io5'
import { getAcademicYear } from '@/api/AcademicYearAPI'
import { promoteStudent } from '@/api/StudentAPI'
import { FormSelect } from '@/components/ui/forms/Input'

interface PromoteProps {
  student: any
}

const StudentPromote = ({ student }: PromoteProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      studentId: '',
      academicYearId: '',
      year: '',
      semester: '',
    },
  })

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academicYears'],
    queryFn: getAcademicYear,
  })

  useEffect(() => {
    if (open && student) {
      setValue('studentId', student.id.toString())

      // Logic គណនាឆ្នាំ និង ឆមាសបន្ទាប់អូតូ
      const isSemester2 = Number(student.semester) === 2
      setValue(
        'year',
        isSemester2
          ? (Number(student.year) + 1).toString()
          : student.year.toString(),
      )
      setValue('semester', isSemester2 ? '1' : '2')

      // កំណត់ឆ្នាំសិក្សាបច្ចុប្បន្នជា Default
      if (academicYears.length > 0) {
        const latestYear =
          academicYears.find((ay: any) => ay.isCurrent) ||
          [...academicYears].sort((a, b) => b.id - a.id)[0]
        if (latestYear) setValue('academicYearId', latestYear.id.toString())
      }
    }
  }, [open, student, academicYears, setValue])

  const mutation = useMutation({
    mutationFn: (payload: any) => promoteStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success(
        `បានបន្ថែមឆ្នាំសិក្សាថ្មីសម្រាប់និស្សិត ${student.name} ជោគជ័យ`,
      )
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'ប្រតិបត្តិការមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: any) => {
    const payload = {
      studentId: student.id,
      academicYearId: Number(formData.academicYearId),
      year: Number(formData.year),
      semester: Number(formData.semester),
      facultyId: student.facultyId,
      departmentId: student.departmentId,
      academicLevelId: student.academicLevelId,
    }

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
          title="ឡើងថ្នាក់/បន្ថែមឆ្នាំសិក្សា"
        >
          <IoArrowUpCircle size="18" />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>បន្ថែមឆ្នាំសិក្សាថ្មី</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          រៀបចំការចុះឈ្មោះនិស្សិត{' '}
          <Text weight="bold" color="indigo">
            {student.name}
          </Text>{' '}
          ចូលក្នុងឆមាសបន្ទាប់។
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                ព័ត៌មានបច្ចុប្បន្ន
              </Text>
              <Badge color="blue" variant="soft">
                ឆ្នាំទី {student.year} ឆមាស {student.semester} (
                {student.department?.name})
              </Badge>
            </Box>

            <Grid columns="2" gap="3">
              <FormSelect
                label="ឆ្នាំសិក្សាថ្មី"
                name="academicYearId"
                error={errors.academicYearId}
                control={control}
                options={
                  academicYears.map((ay: any) => ({
                    ...ay,
                    label: `${ay.name} ${ay.isCurrent && '(បច្ចុប្បន្ន)'}`,
                  })) ?? []
                }
                register={register}
                isRequired
                rules={{
                  required: 'សូមជ្រើសរើសឆ្នាំសិក្សា',
                }}
                placeholder="សូមបញ្ចូលឆ្នាំសិក្សា"
              />
              <FormSelect
                label="ឆ្នាំទី"
                name="year"
                error={errors.year}
                control={control}
                options={[
                  { id: '1', name: 'ឆ្នាំទី ១' },
                  { id: '2', name: 'ឆ្នាំទី ២' },
                  { id: '3', name: 'ឆ្នាំទី ៣' },
                  { id: '4', name: 'ឆ្នាំទី ៤' },
                  { id: '5', name: 'ឆ្នាំទី ៥' },
                ]}
                register={register}
                isRequired
                rules={{
                  required: 'សូមជ្រើសរើសឆ្នាំទី',
                }}
                placeholder="សូមបញ្ចូលឆ្នាំទី"
              />

              <FormSelect
                label="ឆមាស"
                name="semester"
                error={errors.semester}
                control={control}
                options={[
                  { id: '1', name: 'ឆមាសទី ១' },
                  { id: '2', name: 'ឆមាសទី ២' },
                ]}
                register={register}
                isRequired
                rules={{
                  required: 'សូមជ្រើសរើសឆមាស',
                }}
                placeholder="សូមបញ្ចូលឆមាស"
              />
            </Grid>

            <Flex gap="3" mt="4" justify="end">
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
              <Button
                type="submit"
                loading={mutation.isPending}
                style={{ cursor: 'pointer' }}
              >
                រក្សាទុកទិន្នន័យ
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default StudentPromote

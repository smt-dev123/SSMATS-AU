import { useEffect } from 'react'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { CoursesType } from '@/types'
import { updateCourse } from '@/api/CourseAPI'
import { getTeachers } from '@/api/TeacherAPI'
import { getSchedules } from '@/api/SchedulesAPI'
import { useAcademicStore } from '@/stores/useAcademicStore'
import { Grid, Box } from '@radix-ui/themes'

interface Props {
  course: CoursesType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CourseUpdate = ({ course, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient()
  const { selectedYearId } = useAcademicStore()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoursesType>({
    defaultValues: {
      day: 'Monday',
      isActive: true,
      credits: 3,
      hours: '45',
    },
  })

  // Populate form when course data is handed in
  useEffect(() => {
    if (course && open) {
      reset({
        ...course,
        teacherId: course.teacherId,
        scheduleId: course.scheduleId,
        credits: Number(course.credits),
        hours: String(course.hours),
      })
    }
  }, [course, open, reset])

  // Fetch Data
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
  })

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules', selectedYearId],
    queryFn: () => getSchedules({ academicYearId: selectedYearId }),
  })

  const mutation = useMutation({
    mutationFn: (formData: CoursesType) => updateCourse(course?.id!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('កែប្រែជោគជ័យ')
      onOpenChange(false)
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'កែប្រែមិនជោគជ័យ')
    },
  })

  const onSubmit = (formData: CoursesType) => {
    mutation.mutate({
      ...formData,
      credits: Number(formData.credits),
      scheduleId: Number(formData.scheduleId),
      academicYearId: Number(selectedYearId),
      hours: String(formData.hours),
    })
  }

  const scheduleList = Array.isArray(schedules) ? schedules : (schedules as any).data || []
  const teacherList = Array.isArray(teachers) ? teachers : (teachers as any).data || []

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="700px" size="3">
        <Dialog.Title>កែប្រែព័ត៌មានថ្នាក់រៀន</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Grid columns={{ initial: '1', md: '2' }} gap="4">
              {/* Course Code */}
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  កូដមុខវិជ្ជា <span className="text-red-500">*</span>
                </Text>
                <TextField.Root
                  {...register('code', { required: 'ត្រូវបញ្ចូលកូដ' })}
                  placeholder="ឧ. CS101"
                />
                {errors.code && (
                  <Text size="1" color="red">
                    {errors.code.message}
                  </Text>
                )}
              </Box>

              {/* Course Name */}
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  ឈ្មោះមុខវិជ្ជា <span className="text-red-500">*</span>
                </Text>
                <TextField.Root
                  {...register('name', { required: 'ត្រូវបញ្ចូលឈ្មោះ' })}
                  placeholder="ឧ. Database Management"
                />
                {errors.name && (
                  <Text size="1" color="red">
                    {errors.name.message}
                  </Text>
                )}
              </Box>

              {/* Credits */}
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  ក្រេឌីត <span className="text-red-500">*</span>
                </Text>
                <TextField.Root
                  type="number"
                  {...register('credits', {
                    required: 'ត្រូវបញ្ចូលក្រេឌីត',
                    valueAsNumber: true,
                  })}
                  placeholder="3"
                />
                {errors.credits && (
                  <Text size="1" color="red">
                    {errors.credits.message}
                  </Text>
                )}
              </Box>

              {/* Hours */}
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  ចំនួនម៉ោង <span className="text-red-500">*</span>
                </Text>
                <TextField.Root
                  {...register('hours', { required: 'ត្រូវបញ្ចូលចំនួនម៉ោង' })}
                  placeholder="45"
                />
                {errors.hours && (
                  <Text size="1" color="red">
                    {errors.hours.message}
                  </Text>
                )}
              </Box>

              {/* Day */}
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  ថ្ងៃបង្រៀន <span className="text-red-500">*</span>
                </Text>
                <Controller
                  name="day"
                  control={control}
                  rules={{ required: 'ត្រូវជ្រើសរើសថ្ងៃ' }}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value as string}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger
                        placeholder="ជ្រើសរើសថ្ងៃ"
                        style={{ width: '100%' }}
                      />
                      <Select.Content>
                        <Select.Item value="Monday">ច័ន្ទ (Monday)</Select.Item>
                        <Select.Item value="Tuesday">អង្គារ (Tuesday)</Select.Item>
                        <Select.Item value="Wednesday">ពុធ (Wednesday)</Select.Item>
                        <Select.Item value="Thursday">ព្រហស្បតិ៍ (Thursday)</Select.Item>
                        <Select.Item value="Friday">សុក្រ (Friday)</Select.Item>
                        <Select.Item value="Saturday">សៅរ៍ (Saturday)</Select.Item>
                        <Select.Item value="Sunday">អាទិត្យ (Sunday)</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.day && (
                  <Text size="1" color="red">
                    {errors.day.message}
                  </Text>
                )}
              </Box>

              {/* Teacher */}
              <Box>
                <Text as="div" size="2" mb="1" weight="bold">
                  គ្រូបង្រៀន <span className="text-red-500">*</span>
                </Text>
                <Controller
                  name="teacherId"
                  control={control}
                  rules={{ required: 'ត្រូវជ្រើសរើសគ្រូ' }}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger
                        placeholder="ជ្រើសរើសគ្រូ"
                        style={{ width: '100%' }}
                      />
                      <Select.Content>
                        {teacherList.map((t: any) => (
                          <Select.Item key={t.id} value={String(t.id)}>
                            {t.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.teacherId && (
                  <Text size="1" color="red">
                    {errors.teacherId.message}
                  </Text>
                )}
              </Box>

              {/* Schedule */}
              <Box className="md:col-span-2">
                <Text as="div" size="2" mb="1" weight="bold">
                  កាលវិភាគយោង (Schedule) <span className="text-red-500">*</span>
                </Text>
                <Controller
                  name="scheduleId"
                  control={control}
                  rules={{ required: 'ត្រូវជ្រើសរើសកាលវិភាគ' }}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <Select.Trigger
                        placeholder="ជ្រើសរើសកាលវិភាគ"
                        style={{ width: '100%' }}
                      />
                      <Select.Content>
                        {scheduleList.map((s: any) => (
                          <Select.Item key={s.id} value={String(s.id)}>
                            {s.department?.name || 'ដេប៉ាតឺម៉ង់'} - ជំនាន់ {s.generation} (ឆ្នាំទី {s.year} ឆមាស {s.semester}) -{' '}
                            {s.studyShift === 'morning'
                              ? 'ព្រឹក'
                              : s.studyShift === 'evening'
                                ? 'ល្ងាច'
                                : 'យប់'}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.scheduleId && (
                  <Text size="1" color="red">
                    {errors.scheduleId.message}
                  </Text>
                )}
              </Box>
            </Grid>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" type="button" style={{ cursor: 'pointer' }} onClick={() => onOpenChange(false)}>ចាកចេញ</Button>
            <Button type="submit" loading={mutation.isPending} style={{ cursor: 'pointer' }}>រក្សាទុកការកែប្រែ</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}


export default CourseUpdate

import { useEffect, useMemo } from 'react'
import {
  Button,
  Dialog,
  Flex,
  Text,
  Box,
  Grid,
  Spinner,
} from '@radix-ui/themes'
import { useForm, useFieldArray } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit } from 'react-icons/fa'
import { CourseItem } from './components/ScheduleFormComponents'
import { getScheduleById, updateSchedule } from '@/api/SchedulesAPI'
import { getFaculties } from '@/api/FacultyAPI'
import { getDepartments } from '@/api/DepartmentAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { getAcademicYear } from '@/api/AcademicYearAPI'
import { getRoom } from '@/api/RoomAPI'
import { getTeachers } from '@/api/TeacherAPI'
import { getSessionTime } from '@/api/SessionTime'
import { FormSelect, FormInput } from '@/components/ui/forms/Input'

interface Props {
  scheduleId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ScheduleUpdate = ({ scheduleId, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      schedule: { studyShift: 'morning', semester: 1, year: 1, generation: 1 },
      courses: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'courses' })
  const selectedFacultyId = watch('schedule.facultyId')
  const scheduleErrors = errors.schedule as any

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })
  const { data: levels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: getAcademicLevels,
  })
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academicYears'],
    queryFn: getAcademicYear,
  })
  const { data: roomsResponse } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRoom('all'),
  })
  const rooms = (roomsResponse as any)?.data || []

  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers(),
  })
  const teachers = (teachersResponse as any)?.data || []
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessionTimes'],
    queryFn: getSessionTime,
  })
  const { data: allDeps = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  })

  const departments = useMemo(() => {
    return (allDeps as any[]).filter(
      (d) => String(d.facultyId) === String(selectedFacultyId),
    )
  }, [allDeps, selectedFacultyId])

  const { data: existingData, isLoading: isLoadingData } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => getScheduleById(scheduleId!),
    enabled: !!scheduleId && open,
  })

  useEffect(() => {
    if (open && existingData && !isLoadingData) {
      reset({
        schedule: {
          ...existingData,
          facultyId: String(existingData.facultyId),
          departmentId: String(existingData.departmentId),
          academicLevelId: String(existingData.academicLevelId),
          academicYearId: String(existingData.academicYearId),
          classroomId: String(existingData.classroomId),
          semesterStart: existingData.semesterStart
            ? existingData.semesterStart.split('T')[0]
            : '',
          semesterEnd: existingData.semesterEnd
            ? existingData.semesterEnd.split('T')[0]
            : '',
          sessionTimeId: String(existingData.sessionTimeId),
        },
        courses:
          existingData.courses?.map((c: any) => ({
            ...c,
            teacherId: String(c.teacherId),
            hours: String(c.hours),
          })) || [],
      })
    }
  }, [existingData, isLoadingData, reset, open])

  const mutation = useMutation({
    mutationFn: (data: any) => updateSchedule(scheduleId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] })
      toast.success('កែប្រែកាលវិភាគជោគជ័យ')
      onOpenChange(false)
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'កែប្រែមិនជោគជ័យ'),
  })

  const onSubmit = (data: any) => {
    const payload = {
      schedule: {
        ...data.schedule,
        facultyId: Number(data.schedule.facultyId),
        departmentId: Number(data.schedule.departmentId),
        academicLevelId: Number(data.schedule.academicLevelId),
        academicYearId: Number(data.schedule.academicYearId),
        classroomId: Number(data.schedule.classroomId),
        sessionTimeId: Number(data.schedule.sessionTimeId),
        semesterStart: new Date(data.schedule.semesterStart),
        semesterEnd: new Date(data.schedule.semesterEnd),
      },
      courses: data.courses.map((c: any) => ({
        ...c,
        id: c.id ? Number(c.id) : undefined,
        credits: Number(c.credits),
        hours: String(c.hours),
      })),
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        key={scheduleId}
        maxWidth="1000px"
        className="rounded-3xl"
      >
        <Dialog.Title>
          <Flex align="center" gap="2">
            <FaEdit className="text-orange-500" /> កែប្រែកាលវិភាគសិក្សា
          </Flex>
        </Dialog.Title>
        <Dialog.Description size="2" mb="4" className="text-slate-500">
          កែសម្រួលព័ត៌មានរដ្ឋបាល ឬបញ្ជីមុខវិជ្ជាសម្រាប់កាលវិភាគនេះ។
        </Dialog.Description>

        {isLoadingData ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            p="9"
            gap="3"
          >
            <Spinner size="3" />
            <Text color="gray">កំពុងទាញយកទិន្នន័យ...</Text>
          </Flex>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex
              direction="column"
              gap="5"
              className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              {/* Section 1: General Info */}
              <Box className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                <Text
                  weight="bold"
                  size="3"
                  mb="4"
                  as="div"
                  className="flex align-center gap-2 text-blue-700"
                >
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[12px]">
                    ១
                  </span>
                  ព័ត៌មានទូទៅ
                </Text>

                <Grid columns={{ initial: '1', md: '3' }} gap="4">
                  <FormSelect
                    label="មហាវិទ្យាល័យ"
                    name="schedule.facultyId"
                    control={control}
                    options={faculties}
                    placeholder="រើសមហាវិទ្យាល័យ"
                    error={scheduleErrors?.facultyId}
                    isRequired
                  />
                  <FormSelect
                    label="ដេប៉ាតឺម៉ង់"
                    name="schedule.departmentId"
                    control={control}
                    options={departments}
                    disabled={!selectedFacultyId}
                    placeholder="រើសដេប៉ាតឺម៉ង់"
                    error={scheduleErrors?.departmentId}
                    isRequired
                  />
                  <FormSelect
                    label="ឆ្នាំសិក្សា"
                    name="schedule.academicYearId"
                    control={control}
                    options={academicYears}
                    placeholder="រើសឆ្នាំសិក្សា"
                    error={scheduleErrors?.academicYearId}
                  />
                  <FormSelect
                    label="កម្រិតសិក្សា"
                    name="schedule.academicLevelId"
                    control={control}
                    options={levels}
                    labelKey="level"
                    placeholder="កម្រិត"
                    error={scheduleErrors?.academicLevelId}
                    isRequired
                  />

                  <Grid columns="2" gap="2">
                    <FormInput
                      label="ជំនាន់ទី"
                      name="schedule.generation"
                      register={register}
                      type="number"
                      rules={{ required: 'ត្រូវបញ្ចូលជំនាន់' }}
                      error={scheduleErrors?.generation}
                      isRequired
                    />
                    <FormInput
                      label="ឆ្នាំទី"
                      name="schedule.year"
                      register={register}
                      type="number"
                      rules={{ required: 'ត្រូវបញ្ចូលឆ្នាំ' }}
                      error={scheduleErrors?.year}
                      isRequired
                    />
                  </Grid>

                  <Grid columns="2" gap="2">
                    <FormInput
                      label="ឆមាស"
                      name="schedule.semester"
                      register={register}
                      type="number"
                      rules={{ required: 'ត្រូវបញ្ចូលឆមាស' }}
                      error={scheduleErrors?.semester}
                      isRequired
                    />
                    <FormSelect
                      label="វេនសិក្សា"
                      name="schedule.studyShift"
                      control={control}
                      options={[
                        { id: 'morning', name: 'ព្រឹក' },
                        { id: 'evening', name: 'ល្ងាច' },
                        { id: 'night', name: 'យប់' },
                      ]}
                      error={scheduleErrors?.studyShift}
                      isRequired
                    />
                  </Grid>

                  <FormSelect
                    label="បន្ទប់សិក្សា"
                    name="schedule.classroomId"
                    control={control}
                    options={rooms.map((r: any) => ({
                      id: r.id,
                      name: `${r.name} (${r.building?.name})`,
                    }))}
                    error={scheduleErrors?.classroomId}
                    isRequired
                  />
                  <FormInput
                    label="ចាប់ផ្ដើមឆមាស"
                    name="schedule.semesterStart"
                    register={register}
                    type="date"
                    rules={{ required: 'ត្រូវជ្រើសរើសថ្ងៃចាប់ផ្ដើម' }}
                    error={scheduleErrors?.semesterStart}
                    isRequired
                  />
                  <FormInput
                    label="បញ្ចប់ឆមាស"
                    name="schedule.semesterEnd"
                    register={register}
                    type="date"
                    rules={{ required: 'ត្រូវជ្រើសរើសថ្ងៃបញ្ចប់' }}
                    error={scheduleErrors?.semesterEnd}
                    isRequired
                  />
                  <FormSelect
                    label="ម៉ោងសិក្សា (Session)"
                    name="schedule.sessionTimeId"
                    control={control}
                    options={sessions.map((s: any) => ({
                      id: s.id,
                      name: `${s.shift.toUpperCase()}: ${s.firstSessionStartTime} - ${s.secondSessionEndTime}`,
                    }))}
                    error={scheduleErrors?.sessionTimeId}
                    isRequired
                  />
                </Grid>
              </Box>

              {/* Section 2: Courses */}
              <Box>
                <Flex justify="between" align="center" mb="3">
                  <Text
                    weight="bold"
                    size="3"
                    className="flex align-center gap-2 text-blue-700"
                  >
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[12px]">
                      ២
                    </span>
                    បញ្ជីមុខវិជ្ជា
                  </Text>
                  <Button
                    variant="soft"
                    size="2"
                    type="button"
                    onClick={() =>
                      append({
                        name: '',
                        code: '',
                        credits: 3,
                        hours: '45',
                        day: 'Monday',
                        teacherId: '',
                      })
                    }
                    className="cursor-pointer"
                  >
                    <FaPlus /> បន្ថែមមុខវិជ្ជា
                  </Button>
                </Flex>

                <Flex direction="column" gap="3">
                  {fields.map((field, index) => (
                    <CourseItem
                      key={field.id}
                      index={index}
                      register={register}
                      control={control}
                      remove={remove}
                      teachers={teachers}
                      sessions={sessions}
                      isDisableRemove={fields.length === 1}
                      errors={errors}
                    />
                  ))}
                </Flex>
              </Box>
            </Flex>

            <Flex gap="3" mt="6" justify="end">
              <Button
                variant="soft"
                color="gray"
                size="3"
                type="button"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                size="3"
                color="orange"
                loading={mutation.isPending}
                className="cursor-pointer px-8"
              >
                រក្សាទុកការកែប្រែ
              </Button>
            </Flex>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ScheduleUpdate

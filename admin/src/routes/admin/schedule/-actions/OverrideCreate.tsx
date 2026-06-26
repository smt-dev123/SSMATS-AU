import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  Flex,
  Select,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FaBan, FaCalendarAlt } from 'react-icons/fa'
import { createOverride, getDailySchedule } from '@/api/OverrideAPI'
import { getTeachers } from '@/api/TeacherAPI'
import { getRoom } from '@/api/RoomAPI'

interface Props {
  scheduleId?: number
}

const OverrideCreate = ({ scheduleId }: Props) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { control, register, handleSubmit, reset, watch, setValue } =
    useForm<any>({
      defaultValues: {
        date: new Date().toISOString().split('T')[0],
        isCancelled: false,
      },
    })

  const selectedDate = watch('date')
  const selectedCourseId = watch('originalCourseId')
  const isCancelled = watch('isCancelled')

  const { data: allDailyCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['daily_schedule', selectedDate],
    queryFn: () => getDailySchedule(selectedDate),
    enabled: !!selectedDate && open,
  })

  const dailyCourses = useMemo(() => {
    if (!scheduleId) return allDailyCourses
    return (allDailyCourses as Array<any>).filter(
      (c: any) => Number(c.scheduleId) === Number(scheduleId),
    )
  }, [allDailyCourses, scheduleId])

  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers(),
    enabled: open,
  })
  const teachers = (teachersResponse)?.data || []

  const { data: roomsResponse } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRoom('all'),
    enabled: open,
  })
  const rooms = (roomsResponse)?.data || []

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const selectedCourse = useMemo(() => {
    return dailyCourses.find(
      (c: any) => String(c.id) === String(selectedCourseId),
    )
  }, [dailyCourses, selectedCourseId])

  const mutation = useMutation({
    mutationFn: (data: any) => createOverride(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrides'] })
      queryClient.invalidateQueries({ queryKey: ['daily_schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      toast.success('បង្កើតការផ្លាស់ប្ដូរកាលវិភាគជោគជ័យ')
      setOpen(false)
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'បង្កើតមិនជោគជ័យ')
    },
  })

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      originalCourseId: Number(data.originalCourseId),
      replacementTeacherId: data.replacementTeacherId
        ? String(data.replacementTeacherId)
        : null,
      replacementClassroomId: data.replacementClassroomId
        ? Number(data.replacementClassroomId)
        : null,
      date: new Date(data.date),
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="outline" color="orange" style={{ cursor: 'pointer' }}>
          <FaCalendarAlt /> ប្ដូរកាលវិភាគមួយថ្ងៃ
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="550px">
        <Dialog.Title>ប្ដូរកាលវិភាគសម្រាប់តែមួយថ្ងៃ</Dialog.Title>
        <Dialog.Description size="2" mb="4" color="gray">
          ជ្រើសរើសថ្ងៃ និងមុខវិជ្ជាដែលត្រូវផ្លាស់ប្ដូរ ឬលុបចេញសម្រាប់តែថ្ងៃនោះ។
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                កាលបរិច្ឆេទ
              </Text>
              <TextField.Root
                type="date"
                {...register('date', { required: true })}
                onChange={(e) => {
                  register('date').onChange(e)
                  setValue('originalCourseId', undefined) // Reset course if date changes
                }}
              />
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                ជ្រើសរើសមុខវិជ្ជា
              </Text>
              <Controller
                name="originalCourseId"
                control={control}
                rules={{ required: !isCancelled }}
                render={({ field }) => (
                  <Select.Root
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                    disabled={isLoadingCourses || dailyCourses.length === 0}
                  >
                    <Select.Trigger
                      placeholder={
                        isLoadingCourses
                          ? 'កំពុងទាញទិន្នន័យ...'
                          : dailyCourses.length === 0
                            ? 'មិនមានម៉ោងសិក្សាទេ'
                            : 'ជ្រើសរើសមុខវិជ្ជា'
                      }
                      style={{ width: '100%' }}
                    />
                    <Select.Content position="popper">
                      {(dailyCourses as Array<any>).map((course: any) => (
                        <Select.Item key={course.id} value={String(course.id)}>
                          {course.name} (
                          {course.sessionTime?.firstSessionStartTime} -{' '}
                          {course.teacher?.name})
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {dailyCourses.length === 0 &&
                !isLoadingCourses &&
                selectedDate && (
                  <Text size="1" color="gray" mt="1">
                    មិនមានកាលវិភាគសម្រាប់ថ្ងៃចន្ទ/អង្គារ... នេះទេ
                  </Text>
                )}
            </Box>

            {selectedCourse && (
              <Box className="bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
                <Text size="2" color="blue">
                  កាលវិភាគដើម៖ {selectedCourse.name} បង្រៀនដោយ{' '}
                  {selectedCourse.teacher?.name} នៅបន្ទប់{' '}
                  {selectedCourse.schedule?.classroom?.name}
                </Text>
              </Box>
            )}

            <Separator size="4" />

            <Box>
              <Flex gap="4" align="center" mb="3">
                <Text weight="bold">ការកំណត់ថ្មី</Text>
                <Flex align="center" gap="2">
                  <input
                    type="checkbox"
                    id="isCancelled"
                    {...register('isCancelled')}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="isCancelled"
                    className="text-sm text-red-600 font-bold flex align-center gap-1"
                  >
                    <FaBan /> ឈប់សម្រាក
                  </label>
                </Flex>
              </Flex>

              {!isCancelled && (
                <Flex direction="column" gap="3">
                  <Box>
                    <Text as="div" size="1" mb="1" weight="bold">
                      ប្ដូរគ្រូបង្រៀន (ជំនួសដោយ)
                    </Text>
                    <Controller
                      name="replacementTeacherId"
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger
                            placeholder="រក្សាទុកគ្រូដើម"
                            style={{ width: '100%' }}
                          />
                          <Select.Content position="popper">
                            {(teachers as Array<any>).map((t: any) => (
                              <Select.Item key={t.id} value={String(t.id)}>
                                {t.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Box>

                  <Box>
                    <Text as="div" size="1" mb="1" weight="bold">
                      ប្ដូរបន្ទប់សិក្សា
                    </Text>
                    <Controller
                      name="replacementClassroomId"
                      control={control}
                      render={({ field }) => (
                        <Select.Root
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger
                            placeholder="រក្សាទុកបន្ទប់ដើម"
                            style={{ width: '100%' }}
                          />
                          <Select.Content position="popper">
                            {(rooms as Array<any>).map((r: any) => (
                              <Select.Item key={r.id} value={String(r.id)}>
                                {r.name} ({r.building?.name})
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      )}
                    />
                  </Box>
                </Flex>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                សម្គាល់ / មូលហេតុ
              </Text>
              <TextField.Root
                {...register('note')}
                placeholder="ឧ. ប្ដូរវេនបង្រៀនឱ្យគ្រូ..."
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="6" justify="end">
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
              រក្សាទុក
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default OverrideCreate

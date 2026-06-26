import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Box,
  Card,
  Flex,
  IconButton,
  ScrollArea,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import {
  FaBan,
  FaCalendarDay,
  FaMapMarkerAlt,
  FaTrash,
  FaUserTie,
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { format, isAfter, isToday, parseISO } from 'date-fns'
import { km } from 'date-fns/locale'
import { deleteOverride, getOverrides } from '@/api/OverrideAPI'

interface Props {
  scheduleId?: number
}

const UpcomingOverrides = ({ scheduleId }: Props) => {
  const queryClient = useQueryClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['overrides'],
    queryFn: () => getOverrides(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOverride(id),
    onSuccess: () => {
      toast.success('លុបការប្ដូរបានជោគជ័យ')
      queryClient.invalidateQueries({ queryKey: ['overrides'] })
      queryClient.invalidateQueries({ queryKey: ['daily_schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onError: () => toast.error('មិនអាចលុបបានទេ'),
  })

  // Filter for today and future, and optionally by scheduleId
  const upcoming = overrides
    .filter((o: any) => {
      const oDate = parseISO(o.date)
      const matchesSchedule = scheduleId
        ? Number(o.originalCourse?.scheduleId) === Number(scheduleId)
        : true
      return (isToday(oDate) || isAfter(oDate, today)) && matchesSchedule
    })
    .sort(
      (a: any, b: any) =>
        parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    )

  if (isLoading)
    return (
      <Box mb="4">
        <Text size="1" color="gray">
          កំពុងទាញទិន្នន័យការផ្លាស់ប្ដូរ...
        </Text>
      </Box>
    )
  if (upcoming.length === 0) return null

  return (
    <Box mb="6">
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarDay className="text-red-700" />
        <Text size="2" weight="bold" color="red">
          ជំនួសកាលវិភាគសប្ដាហ៍នេះ
        </Text>
        <Badge variant="surface" color="red" size="1">
          {upcoming.length}
        </Badge>
      </div>

      <ScrollArea scrollbars="horizontal" style={{ width: '100%' }}>
        <Flex gap="3" pb="3">
          {upcoming.map((o: any) => (
            <Card
              key={o.id}
              style={{
                minWidth: '280px',
                borderLeft: `4px solid ${o.isCancelled ? 'var(--red-9)' : 'var(--blue-9)'}`,
              }}
            >
              <Flex direction="column" gap="2">
                <Flex justify="between" align="start">
                  <Box>
                    <Text size="1" weight="bold" color="gray" as="div">
                      {format(parseISO(o.date), 'EEEE, d MMMM yyyy', {
                        locale: km,
                      })}
                    </Text>
                    <Text size="3" weight="bold" mt="1" as="div">
                      {o.originalCourse?.name}
                    </Text>
                  </Box>
                  <Tooltip content="លុបការប្ដូរនេះ">
                    <IconButton
                      size="1"
                      color="red"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(o.id)}
                      loading={
                        deleteMutation.isPending &&
                        deleteMutation.variables === o.id
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <FaTrash />
                    </IconButton>
                  </Tooltip>
                </Flex>

                <Box className="p-2 rounded bg-slate-50 border border-slate-100 dark:bg-slate-700 dark:border-slate-600">
                  {o.isCancelled ? (
                    <Flex
                      align="center"
                      gap="2"
                      className="text-red-600 dark:text-red-400"
                    >
                      <FaBan size="12" />
                      <Text size="2" weight="bold">
                        ឈប់សម្រាក (Cancelled)
                      </Text>
                    </Flex>
                  ) : (
                    <Flex direction="column" gap="1">
                      {o.replacementTeacher && (
                        <Flex align="center" gap="2" className="text-blue-600">
                          <FaUserTie size="12" />
                          <Text size="2">
                            គ្រូថ្មី: <b>{o.replacementTeacher.name}</b>
                          </Text>
                        </Flex>
                      )}
                      {o.replacementClassroom && (
                        <Flex
                          align="center"
                          gap="2"
                          className="text-indigo-600"
                        >
                          <FaMapMarkerAlt size="12" />
                          <Text size="2">
                            បន្ទប់ថ្មី: <b>{o.replacementClassroom.name}</b>
                          </Text>
                        </Flex>
                      )}
                      {!o.replacementTeacher &&
                        !o.replacementClassroom &&
                        !o.isCancelled && (
                          <Text size="2" color="gray">
                            មានការផ្លាស់ប្ដូរព័ត៌មាន
                          </Text>
                        )}
                    </Flex>
                  )}
                </Box>

                {o.note && (
                  <Text size="1" color="gray" className="italic">
                    *{o.note}
                  </Text>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  )
}

export default UpcomingOverrides

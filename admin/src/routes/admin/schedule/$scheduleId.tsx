import { Flex, Spinner, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import UpcomingOverrides from './-actions/UpcomingOverrides'
import { getScheduleById } from '@/api/SchedulesAPI'
import { useAcademicStore } from '@/stores/useAcademicStore'
import { ScheduleHeader } from '@/features/schedule/components/ScheduleHeader'
import { ScheduleInfoCard } from '@/features/schedule/components/ScheduleInfoCard'
import { ScheduleTimetable } from '@/features/schedule/components/ScheduleTimetable'

export const Route = createFileRoute('/admin/schedule/$scheduleId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { scheduleId } = Route.useParams()
  const { selectedYearName } = useAcademicStore()

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => getScheduleById(Number(scheduleId)),
  })

  const schedule = res || null

  if (isLoading)
    return (
      <Flex justify="center" align="center" className="h-[60vh]">
        <Spinner size="3" />
        <Text ml="3" color="gray">
          កំពុងទាញយកកាលវិភាគ...
        </Text>
      </Flex>
    )

  if (error || !schedule)
    return (
      <Flex justify="center" p="9">
        <Text color="red" weight="bold" size="5">
          មិនអាចរកឃើញកាលវិភាគនេះទេ!
        </Text>
      </Flex>
    )

  return (
    <div className="space-y-6 print:p-0">
      <ScheduleHeader schedule={schedule} />

      <ScheduleInfoCard
        schedule={schedule}
        selectedYearName={selectedYearName}
      />

      <UpcomingOverrides scheduleId={Number(scheduleId)} />

      <ScheduleTimetable schedule={schedule} />

      <Flex
        justify="center"
        p="4"
        className="text-gray-400 text-[11px] uppercase tracking-widest"
      >
        <Text>
          Updated:{' '}
          {schedule.updatedAt
            ? new Date(schedule.updatedAt).toLocaleDateString('kh-KH')
            : 'N/A'}
        </Text>
      </Flex>
    </div>
  )
}

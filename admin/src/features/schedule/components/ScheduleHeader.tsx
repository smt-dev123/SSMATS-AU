import { Box, Flex, Text } from '@radix-ui/themes'
import { FaArrowLeft } from 'react-icons/fa'
import { useRouter } from '@tanstack/react-router'
import OverrideCreate from '@/routes/admin/schedule/-actions/OverrideCreate'
import { useSessionContext } from '@/providers/AuthProvider'
import ExportTimetableExcel from '@/routes/admin/schedule/-exports/ExportTimetableExcel'
import PDFDownload from '@/components/ui/PDFDownload'
import { TimetableReport } from '@/routes/admin/schedule/-exports/ExportTimetablePDF'

interface ScheduleHeaderProps {
  schedule: any
}

export function ScheduleHeader({ schedule }: ScheduleHeaderProps) {
  const router = useRouter()
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  return (
    <Flex
      direction={{ initial: 'column', sm: 'row' }}
      justify="between"
      align={{ initial: 'start', sm: 'center' }}
      gap="4"
      className="print:hidden"
    >
      <Flex gap="3" align="center">
        <button
          onClick={() => router.history.back()}
          className="cursor-pointer hover:bg-gray-200 p-2.5 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors duration-300"
        >
          <FaArrowLeft size={14} />
        </button>
        <Box>
          <Text size="5" weight="bold">
            កាលវិភាគសិក្សា
          </Text>
        </Box>
      </Flex>
      <Flex gap="2" wrap="wrap">
        <PDFDownload
          document={<TimetableReport schedule={schedule} />}
          fileName={`timetable_${schedule?.id}.pdf`}
        />
        <ExportTimetableExcel schedule={schedule} />

        {(role === 'staff' || role === 'admin' || role === 'manager') && (
          <OverrideCreate scheduleId={schedule?.id} />
        )}
      </Flex>
    </Flex>
  )
}

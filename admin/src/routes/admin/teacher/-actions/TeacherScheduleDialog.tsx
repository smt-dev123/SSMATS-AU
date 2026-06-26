import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
} from '@radix-ui/themes'
import { FaCalendarAlt } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { TeacherTimetableReport } from '../-exports/ExportTeacherPDF'
import ExportTeacherExcel from '../-exports/ExportTeacherExcel'
import type { TeachersType } from '@/types'
import { getCourses } from '@/api/CourseAPI'
import { useAcademicStore } from '@/stores/useAcademicStore'
import { TeacherTimetable } from '@/features/schedule/components/TeacherTimetable'
import PDFDownload from '@/components/ui/PDFDownload'

interface Props {
  data: TeachersType
}

const TeacherScheduleDialog = ({ data }: Props) => {
  const { selectedYearId, selectedYearName } = useAcademicStore()
  const [open, setOpen] = useState(false)

  // Export logic moved to separate components

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['teacher-courses', data.id, selectedYearId],
    queryFn: () =>
      getCourses({
        teacherId: Number(data.id),
        academicYearId: selectedYearId || undefined,
        limit: 100, // Fetch all courses
      }),
    enabled: open && !!selectedYearId,
  })

  const courses = res?.data || []

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <IconButton
          size="1"
          color="indigo"
          variant="surface"
          style={{ cursor: 'pointer' }}
          title="កាលវិភាគបង្រៀន"
        >
          <FaCalendarAlt />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="1200px"
        style={{ padding: '24px', borderRadius: '16px' }}
      >
        <Flex justify="between" align="center" mb="4">
          <Box>
            <Heading size="5" color="indigo" mb="1">
              កាលវិភាគបង្រៀន
            </Heading>
            <Text size="2" color="gray">
              គ្រូបង្រៀន៖ {data.name} | ឆ្នាំសិក្សា៖{' '}
              {selectedYearName || 'ទាំងអស់'}
            </Text>
          </Box>
        </Flex>

        <Box my="4">
          {isLoading ? (
            <Flex justify="center" align="center" style={{ height: '300px' }}>
              <Spinner size="3" />
              <Text ml="3" color="gray">
                កំពុងទាញយកកាលវិភាគ...
              </Text>
            </Flex>
          ) : error ? (
            <Flex justify="center" p="9">
              <Text color="red" weight="bold" size="3">
                មានបញ្ហាក្នុងការទាញយកកាលវិភាគនេះទេ!
              </Text>
            </Flex>
          ) : (
            <TeacherTimetable courses={courses} />
          )}
        </Box>

        <Flex justify="between" mt="6">
          <Flex gap="3">
            {courses.length > 0 && (
              <>
                <PDFDownload
                  document={
                    <TeacherTimetableReport teacher={data} courses={courses} />
                  }
                  fileName={`កាលវិភាគបង្រៀន_${data.name}.pdf`}
                />
                <ExportTeacherExcel teacher={data} courses={courses} />
              </>
            )}
          </Flex>
          <Dialog.Close>
            <Button
              variant="soft"
              color="gray"
              size="2"
              style={{ cursor: 'pointer' }}
            >
              បិទ
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default TeacherScheduleDialog

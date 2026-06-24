import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box, Flex, Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { getSchedules, getMySchedule } from '@/api/SchedulesAPI'
import { getCourses } from '@/api/CourseAPI'
import { useAcademicStore } from '@/stores/useAcademicStore'
import FetchData from '@/components/FetchData'
import { ScheduleTable } from '@/features/schedule/ScheduleTable'
import ScheduleCreate from './-actions/Create'
import ScheduleUpdate from './-actions/Update'
import ExportExcel from './-exports/ExportExcel'
import PDFDownload from '@/components/ui/PDFDownload'
import { ScheduleReport } from './-exports/ExportPDF'
import { useSessionContext } from '@/providers/AuthProvider'
import { useState, useEffect } from 'react'
import { getFaculties } from '@/api/FacultyAPI'
import { getDepartments } from '@/api/DepartmentAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { TeacherTimetable } from '@/features/schedule/components/TeacherTimetable'
import { ScheduleFilter } from '@/features/schedule/components/ScheduleFilter'

type ScheduleSearch = {
  name?: string
  facultyId?: string
  departmentId?: string
  academicLevelId?: string
}

export const Route = createFileRoute('/admin/schedule/')({
  validateSearch: (search: Record<string, unknown>): ScheduleSearch => {
    return {
      name: (search.name as string) || '',
      facultyId: (search.facultyId as string) || 'all',
      departmentId: (search.departmentId as string) || 'all',
      academicLevelId: (search.academicLevelId as string) || 'all',
    }
  },
  component: ScheduleListComponent,
})

function ScheduleListComponent() {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role
  const { selectedYearId } = useAcademicStore()
  const navigate = useNavigate({ from: Route.fullPath })
  const { name, facultyId, departmentId, academicLevelId } = Route.useSearch()

  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null,
  )
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const [draft, setDraft] = useState<ScheduleSearch>({
    name,
    facultyId,
    departmentId,
    academicLevelId,
  })

  useEffect(() => {
    setDraft({ name, facultyId, departmentId, academicLevelId })
  }, [name, facultyId, departmentId, academicLevelId])

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  })
  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: getAcademicLevels,
  })

  const {
    data: schedulesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'schedules',
      selectedYearId,
      role,
      name,
      facultyId,
      departmentId,
      academicLevelId,
    ],
    queryFn: () => {
      if (role === 'student') {
        return getMySchedule()
      }
      return getSchedules({
        name,
        academicYearId: selectedYearId!,
        facultyId: facultyId === 'all' ? undefined : Number(facultyId),
        departmentId: departmentId === 'all' ? undefined : Number(departmentId),
        academicLevelId:
          academicLevelId === 'all' ? undefined : Number(academicLevelId),
      })
    },
    enabled: (role === 'student' || !['student', 'teacher'].includes(role)) && !!selectedYearId,
  })

  const {
    data: teacherCoursesResponse,
    isLoading: isLoadingTeacherCourses,
    error: teacherCoursesError,
  } = useQuery({
    queryKey: ['teacher-courses', selectedYearId],
    queryFn: () =>
      getCourses({
        academicYearId: selectedYearId || undefined,
        limit: 100,
      }),
    enabled: role === 'teacher' && !!selectedYearId,
  })

  const schedules = schedulesResponse || []

  const handleApplyFilter = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...draft,
      }),
    })
  }

  const handleClearFilter = () => {
    const reset = {
      name: '',
      facultyId: 'all',
      departmentId: 'all',
      academicLevelId: 'all',
    }
    setDraft(reset)
    navigate({ search: reset })
  }

  const enrichedSchedules = schedules.map((s: any) => ({
    ...s,
    onEdit: (id: number) => {
      setEditingScheduleId(id)
      setIsUpdateOpen(true)
    },
  }))

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="5" weight="bold">
          {role === 'student'
            ? 'កាលវិភាគសិក្សារបស់ខ្ញុំ'
            : role === 'teacher'
              ? 'កាលវិភាគបង្រៀនរបស់ខ្ញុំ'
              : 'គ្រប់គ្រងកាលវិភាគសិក្សា'}
        </Text>
        <Flex gap="3">
          <PDFDownload
            document={<ScheduleReport data={schedules} />}
            fileName="schedule-report.pdf"
          />
          <ExportExcel data={schedules} />

          {['admin', 'manager', 'staff'].includes(role) && <ScheduleCreate />}
        </Flex>
      </Flex>

      {!['student', 'teacher'].includes(role) && (
        <ScheduleFilter
          draft={draft}
          setDraft={setDraft}
          faculties={faculties}
          departments={departments}
          academicLevels={academicLevels}
          handleApplyFilter={handleApplyFilter}
          handleClearFilter={handleClearFilter}
        />
      )}

      {role === 'teacher' ? (
        <FetchData isLoading={isLoadingTeacherCourses} error={teacherCoursesError} data={teacherCoursesResponse}>
          <Box mt="4">
            <TeacherTimetable courses={teacherCoursesResponse?.data || []} />
          </Box>
        </FetchData>
      ) : (
        <FetchData isLoading={isLoading} error={error} data={schedules}>
          <ScheduleTable data={enrichedSchedules} />
        </FetchData>
      )}

      <ScheduleUpdate
        scheduleId={editingScheduleId}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
    </Box>
  )
}

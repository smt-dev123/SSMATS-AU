import { useTitle } from '@/hooks/useTitle'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'

import { getCourseStudents, getCourseById } from '@/api/CourseAPI'
import { getCourseAttendance, markBulkAttendance } from '@/api/AttendanceAPI'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionContext } from '@/providers/AuthProvider'
import { formatDate } from '@/hooks/useDate'

import { AttendanceHeader } from '@/features/attendance/components/AttendanceHeader'
import { CourseInfoCard } from '@/features/attendance/components/CourseInfoCard'
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable'
import { AttendanceCallouts } from '@/features/attendance/components/AttendanceCallouts'
import { checkAttendanceAccess } from '@/features/attendance/utils'

export const Route = createFileRoute('/admin/course/attendance/$attendanceId')({
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('គ្រប់គ្រងវត្តមាន')
  const { attendanceId }: any = Route.useParams()
  const courseId = Number(attendanceId)
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const queryClient = useQueryClient()
  const { data: session } = useSessionContext()
  const user = session?.user
  const role = (user as any)?.role || ''
  const canChangeDate = role === 'admin' || role === 'manager'

  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSession, setSelectedSession] = useState<number>(1)

  // Fetch Students for the course
  const { data: studentsData, isLoading: isLoadStudents } = useQuery({
    queryKey: ['course_students', courseId],
    queryFn: () => getCourseStudents(courseId),
  })

  const formattedStudentsData = studentsData?.map((student: any) => ({
    ...student,
    dob: formatDate(student.dob).display(),
  }))

  const students = formattedStudentsData || []

  // Fetch Course Details
  const { data: course, isLoading: isLoadCourse } = useQuery({
    queryKey: ['course_detail', courseId],
    queryFn: () => getCourseById(courseId),
  })

  // Fetch existing attendance for the selected date
  const { data: existingRecordsData, isLoading: isLoadAttendance } = useQuery({
    queryKey: ['course_attendance', courseId, selectedDate, selectedSession],
    queryFn: () => getCourseAttendance(courseId, selectedDate, selectedSession),
  })
  const existingRecords = existingRecordsData || []

  const [selected, setSelected] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)

  // Check access for teachers
  const accessCheck = useMemo(
    () => checkAttendanceAccess(course, selectedDate, role),
    [course, selectedDate, role],
  )

  // Prepopulate selections
  useEffect(() => {
    if (isLoadStudents || isLoadAttendance || isLoadCourse) return
    const initialSelected: Record<string, string> = {}
    const initialNotes: Record<string, string> = {}

    // If existing records found, prepopulate with them
    if (existingRecords && existingRecords.length > 0) {
      existingRecords.forEach((record: any) => {
        initialSelected[record.studentId] = record.status
        initialNotes[record.studentId] = record.notes || ''
      })
      // Fill the rest with absent
      students.forEach((s: any) => {
        if (
          !initialSelected[s.id] &&
          s.isActive &&
          s.educationalStatus === 'enrolled'
        ) {
          initialSelected[s.id] = 'absent'
          initialNotes[s.id] = ''
        }
      })
      setIsEditing(false)
    } else {
      // Default all enrolled to absent
      students.forEach((s: any) => {
        if (s.isActive && s.educationalStatus === 'enrolled') {
          initialSelected[s.id] = 'absent'
          initialNotes[s.id] = ''
        }
      })
      // Only set isEditing if they have access
      setIsEditing(accessCheck.canEdit)
    }

    setSelected(initialSelected)
    setNotes(initialNotes)
  }, [
    studentsData,
    existingRecordsData,
    isLoadStudents,
    isLoadAttendance,
    accessCheck.canEdit,
  ])

  const mutation = useMutation({
    mutationFn: markBulkAttendance,
    onSuccess: () => {
      toast.success('រក្សាទុកវត្តមានបានជោគជ័យ!')
      queryClient.invalidateQueries({
        queryKey: ['course_attendance', courseId, selectedDate, selectedSession],
      })
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || 'មានបញ្ហាបច្ចេកទេស',
      )
    },
  })

  // activeStudents
  const activeStudents = useMemo(
    () =>
      students.filter(
        (s: any) => s.isActive && s.educationalStatus === 'enrolled',
      ),
    [students],
  )

  // ប្តូរ Status ម្នាក់ៗ
  const handleSelect = (studentId: string, status: string) => {
    setSelected((prev) => ({ ...prev, [studentId]: status }))
  }

  // ជ្រើសរើសទាំងអស់ (Select All)
  const handleSelectAll = (status: string) => {
    const newSelection = { ...selected }
    activeStudents.forEach((s: any) => {
      newSelection[s.id] = status
    })
    setSelected(newSelection)
  }

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [studentId]: note }))
  }

  const handleSubmit = async () => {
    if (!accessCheck.canEdit) {
      toast.error(accessCheck.reason || 'លោកគ្រូ/អ្នកគ្រូ មិនអាចស្រង់វត្តមានបានទេ')
      return
    }

    const markedCount = Object.keys(selected).length
    if (markedCount < activeStudents.length) {
      toast.error('សូមបញ្ចូលវត្តមានឱ្យបានគ្រប់សិស្ស!')
      return
    }

    const payload = {
      courseId: courseId,
      date: selectedDate,
      session: selectedSession,
      academicYearId: course?.academicYearId,
      facultyId: course?.schedule?.faculty?.id,
      departmentId: course?.schedule?.department?.id,
      mark: activeStudents.map((s: any) => ({
        studentId: s.id,
        status: selected[s.id],
        notes: notes[s.id] || '',
      })),
    }

    mutation.mutate(payload)
  }

  return (
    <div className="mx-auto space-y-4">
      <AttendanceHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
        canChangeDate={canChangeDate}
        isEditing={isEditing && accessCheck.canEdit}
        setIsEditing={(val) => {
          if (accessCheck.canEdit) {
            setIsEditing(val)
          } else {
            toast.error(accessCheck.reason || 'សិទ្ធិស្រង់វត្តមានត្រូវបានរឹតត្បិត')
          }
        }}
        courseId={courseId}
        role={role}
        handleSubmit={handleSubmit}
        isPending={mutation.isPending}
      />

      <CourseInfoCard course={course} />

      <AttendanceTable
        students={students}
        activeStudents={activeStudents}
        selected={selected}
        notes={notes}
        isEditing={isEditing && accessCheck.canEdit}
        handleSelect={handleSelect}
        handleSelectAll={handleSelectAll}
        handleNoteChange={handleNoteChange}
        course={course}
      />

      <AttendanceCallouts
        hasActiveStudents={activeStudents.length > 0}
        accessReason={!accessCheck.canEdit ? accessCheck.reason : undefined}
      />
    </div>
  )
}

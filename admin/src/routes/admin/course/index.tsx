import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  Clock,
  CalendarDays,
  CheckCircle,
  User,
  Pencil,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAcademicStore } from '@/stores/useAcademicStore'
import FetchData from '@/components/FetchData'
import { getCourses } from '@/api/CourseAPI'
import { Flex, Text, Box, Select, Button } from '@radix-ui/themes'
import CourseCreate from './-actions/Create'
import CourseUpdate from './-actions/Update'
import { useState, useEffect, useMemo } from 'react'

import { useSessionContext } from '@/providers/AuthProvider'
import CourseDelete from './-actions/Delete'
import { ManualPagination } from '@/components/ui/ManualPagination'
import { getFaculties } from '@/api/FacultyAPI'
import { getDepartments } from '@/api/DepartmentAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { IoFilter, IoSearch } from 'react-icons/io5'
import { TextField } from '@radix-ui/themes'

type CourseSearch = {
  name?: string
  page?: number
  limit?: number
  facultyId?: string
  departmentId?: string
  academicLevelId?: string
}

export const Route = createFileRoute('/admin/course/')({
  validateSearch: (search: Record<string, unknown>): CourseSearch => {
    return {
      name: (search.name as string) || '',
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 10,
      facultyId: (search.facultyId as string) || 'all',
      departmentId: (search.departmentId as string) || 'all',
      academicLevelId: (search.academicLevelId as string) || 'all',
    }
  },
  component: CourseListComponent,
})

function CourseListComponent() {
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role
  const { selectedYearId } = useAcademicStore()
  const { name, page, limit, facultyId, departmentId, academicLevelId } =
    Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const [draft, setDraft] = useState<Omit<CourseSearch, 'page' | 'limit'>>({
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
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'courses',
      selectedYearId,
      name,
      page,
      limit,
      facultyId,
      departmentId,
      academicLevelId,
    ],
    queryFn: () =>
      getCourses({
        name,
        academicYearId: selectedYearId!,
        page,
        limit,
        facultyId: facultyId === 'all' ? undefined : Number(facultyId),
        departmentId: departmentId === 'all' ? undefined : Number(departmentId),
        academicLevelId:
          academicLevelId === 'all' ? undefined : Number(academicLevelId),
      }),
    enabled: !!selectedYearId,
  })

  const courses = apiResponse?.data ?? []
  const total = apiResponse?.total ?? 0
  const pageCount = Math.ceil(total / (limit ?? 10))

  const onPaginationChange = (updater: any) => {
    const newState =
      typeof updater === 'function'
        ? updater({ pageIndex: (page ?? 1) - 1, pageSize: limit ?? 10 })
        : updater
    navigate({
      search: (prev) => ({
        ...prev,
        page: newState.pageIndex + 1,
        limit: newState.pageSize,
      }),
    })
  }

  const handleApplyFilter = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...draft,
        page: 1,
      }),
    })
  }

  const handleClearFilter = () => {
    const reset = {
      name: '',
      facultyId: 'all',
      departmentId: 'all',
      academicLevelId: 'all',
      page: 1,
    }
    setDraft(reset)
    navigate({ search: (prev) => ({ ...prev, ...reset }) })
  }

  const filteredDepartments = useMemo(() => {
    if (draft.facultyId === 'all') return []
    return departments.filter(
      (d: any) => String(d.facultyId) === draft.facultyId,
    )
  }, [departments, draft.facultyId])

  return (
    <>
      <Flex justify="between" mb="4">
        <Text size="5" className="font-bold">
          គ្រប់គ្រងវគ្គសិក្សា
        </Text>
        <Flex gap="2">
          {['admin', 'manager', 'staff'].includes(role) && <CourseCreate />}
        </Flex>
      </Flex>

      {!['student', 'teacher'].includes(role) && (
        <Flex justify="between" align="center" mb="3">
          <Box flexGrow="1" maxWidth="300px">
            <Text as="div" size="2" mb="1" weight="bold">
              ស្វែងរក
            </Text>
            <TextField.Root
              placeholder="ស្វែងរកឈ្មោះ ឬកូដ..."
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
            >
              <TextField.Slot>
                <IoSearch />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Flex gap="3" wrap="wrap" align="end">
            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                កម្រិតសិក្សា
              </Text>
              <Select.Root
                value={draft.academicLevelId}
                onValueChange={(val) =>
                  setDraft({ ...draft, academicLevelId: val })
                }
              >
                <Select.Trigger style={{ minWidth: '150px' }} />
                <Select.Content>
                  <Select.Item value="all">ទាំងអស់</Select.Item>
                  {academicLevels.map((level: any) => (
                    <Select.Item key={level.id} value={String(level.id)}>
                      {level.level}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                មហាវិទ្យាល័យ
              </Text>
              <Select.Root
                value={draft.facultyId}
                onValueChange={(val) => {
                  setDraft({ ...draft, facultyId: val, departmentId: 'all' })
                }}
              >
                <Select.Trigger style={{ minWidth: '150px' }} />
                <Select.Content>
                  <Select.Item value="all">ទាំងអស់</Select.Item>
                  {faculties.map((f: any) => (
                    <Select.Item key={f.id} value={String(f.id)}>
                      {f.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="bold">
                ដេប៉ាតឺម៉ង់
              </Text>
              <Select.Root
                value={draft.departmentId}
                onValueChange={(val) =>
                  setDraft({ ...draft, departmentId: val })
                }
                disabled={draft.facultyId === 'all'}
              >
                <Select.Trigger style={{ minWidth: '150px' }} />
                <Select.Content>
                  <Select.Item value="all">ទាំងអស់</Select.Item>
                  {filteredDepartments.map((d: any) => (
                    <Select.Item key={d.id} value={String(d.id)}>
                      {d.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Button
              onClick={handleApplyFilter}
              color="indigo"
              style={{ cursor: 'pointer' }}
            >
              <IoFilter /> ស្វែងរក
            </Button>
            <Button
              variant="soft"
              color="gray"
              onClick={handleClearFilter}
              style={{ cursor: 'pointer' }}
            >
              សម្អាត
            </Button>
          </Flex>
        </Flex>
      )}

      <FetchData isLoading={isLoading} error={error} data={courses}>
        {courses.length === 0 ? (
          <div className="flex h-[calc(100vh-400px)] flex-col items-center justify-center">
            <Text className="text-lg font-bold text-gray-500">
              មិនទាន់មានវគ្គសិក្សាទេ
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course: any) => (
              <div
                key={course.id}
                className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border-b-4 hover:border-b-blue-500"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <BookOpen size={20} />
                  </div>
                  <Flex align="center" gap="2">
                    <BadgeCode code={course.code} />
                    {['admin', 'manager', 'staff'].includes(role) && (
                      <>
                        <button
                          className="text-orange-400 hover:text-orange-600 transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            setEditingCourse(course)
                            setIsUpdateOpen(true)
                          }}
                        >
                          {/* <Flex align="center" gap="1">
                            <Pencil size={14} />
                            កែប្រែ
                          </Flex> */}
                        </button>
                        <CourseDelete data={course} />
                      </>
                    )}
                  </Flex>
                </div>

                {/* Course Info */}
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">
                  មុខជំនាញ: {course?.schedule?.department?.name}
                </h3>

                <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 line-clamp-1">
                  មុខវិជ្ជា: {course.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <Clock size={14} className="mr-2 text-blue-500" />
                    <span>
                      {course.day} |{' '}
                      {course.schedule?.sessionTime?.firstSessionStartTime} -{' '}
                      {course.schedule?.sessionTime?.secondSessionEndTime}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <User size={14} className="mr-2 text-blue-500" />
                    <span className="truncate">
                      គ្រូបង្រៀន៖ {course.teacher?.user?.name || 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 font-medium dark:text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                    </div>
                    បន្ទប់៖ {course.schedule?.classroom?.name || 'TBA'}
                  </div>
                </div>

                {/* Action Buttons: Schedule & Attendance */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to="/admin/schedule/$scheduleId"
                    params={{
                      scheduleId: String(course.scheduleId || course.id),
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-bold hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                  >
                    <CalendarDays size={14} />
                    កាលវិភាគ
                  </Link>

                  <Link
                    to="/admin/course/attendance/$attendanceId"
                    params={{ attendanceId: String(course.id) }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-[11px] font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm hover:shadow-blue-200 dark:hover:shadow-none"
                  >
                    <CheckCircle size={14} />
                    ស្រង់វត្តមាន
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <ManualPagination
          pageIndex={(page ?? 1) - 1}
          pageSize={limit ?? 10}
          pageCount={pageCount}
          onPaginationChange={onPaginationChange}
        />
      </FetchData>

      <CourseUpdate
        course={editingCourse}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
    </>
  )
}

function BadgeCode({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300 italic">
        {code || 'N/A'}
      </span>
    </div>
  )
}

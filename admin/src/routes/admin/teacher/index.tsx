import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box, Button, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { IoSearch, IoFilter } from 'react-icons/io5'
import { useTitle } from '@/hooks/useTitle'
import { useQuery } from '@tanstack/react-query'
import { getTeachers } from '@/api/TeacherAPI'
import { getFaculties } from '@/api/FacultyAPI' // នាំចូល API
import { getAcademicLevels } from '@/api/AcademicLevelAPI' // នាំចូល API
import { TeacherTable } from '@/features/teacher/GenerationTable'
import TeacherCreate from './-actions/Create'
import { useState, useEffect } from 'react'
import FetchData from '@/components/FetchData'
import { useSessionContext } from '@/providers/AuthProvider'
import ExportExcel from './-exports/ExportExcel'
import PDFDownload from '@/components/ui/PDFDownload'
import { TeacherReport } from './-exports/ExportPDF'

type TeacherSearch = {
  search?: string
  degree?: string
  faculty?: string
  major?: string
  page?: number
  limit?: number
}

export const Route = createFileRoute('/admin/teacher/')({
  validateSearch: (search: Record<string, unknown>): TeacherSearch => {
    return {
      search: (search.search as string) || '',
      degree: (search.degree as string) || 'all',
      faculty: (search.faculty as string) || 'all',
      major: (search.major as string) || 'all',
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 10,
    }
  },
  component: RouteComponent,
})
function RouteComponent() {
  useTitle('Teacher Management')
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  const { search, degree, faculty, major, page, limit } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [searchDraft, setSearchDraft] = useState(search)
  const [degreeDraft, setDegreeDraft] = useState(degree)
  const [facultyDraft, setFacultyDraft] = useState(faculty)
  const [majorDraft, setMajorDraft] = useState(major)

  const {
    data: teachersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['teachers', search, degree, faculty, page, limit],
    queryFn: () =>
      getTeachers(
        search,
        faculty === 'all' ? '' : faculty,
        degree === 'all' ? '' : degree,
        page,
        limit,
      ),
  })

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })

  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: getAcademicLevels,
  })

  useEffect(() => {
    setSearchDraft(search)
    setDegreeDraft(degree)
    setFacultyDraft(faculty)
    setMajorDraft(major)
  }, [search, degree, faculty, major])

  const handleApplyFilter = () => {
    navigate({
      search: (prev: Record<string, any>) => ({
        ...prev,
        search: searchDraft || undefined,
        degree: degreeDraft,
        faculty: facultyDraft,
        major: majorDraft,
        page: 1,
      }),
    })
  }

  const handleClearFilter = () => {
    setSearchDraft('')
    setDegreeDraft('all')
    setFacultyDraft('all')
    setMajorDraft('all')
    navigate({
      search: {
        search: '',
        degree: 'all',
        faculty: 'all',
        major: 'all',
        page: 1,
      },
    })
  }

  const total = (teachersData as any)?.total || 0
  const pageCount = Math.ceil(total / (limit ?? 10))

  const onPaginationChange = (updater: any) => {
    const newState =
      typeof updater === 'function'
        ? updater({ pageIndex: (page ?? 1) - 1, pageSize: limit ?? 10 })
        : updater
    navigate({
      search: (prev: Record<string, any>) => ({
        ...prev,
        page: newState.pageIndex + 1,
        limit: newState.pageSize,
      }),
    })
  }

  return (
    <div>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center" mb="2">
          <Text size="5" weight="bold">
            គ្រូបង្រៀន
          </Text>
          <Flex gap="2">
            <PDFDownload
              document={<TeacherReport data={teachersData?.data || []} />}
              fileName="teacher-report.pdf"
            />
            <ExportExcel data={teachersData?.data || []} />

            {['admin', 'manager', 'staff'].includes(role) && <TeacherCreate />}
          </Flex>
        </Flex>

        <Flex justify="between" gap="3" wrap="wrap">
          <Box flexGrow="1" maxWidth="300px">
            <TextField.Root
              placeholder="ស្វែងរក..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
            >
              <TextField.Slot>
                <IoSearch />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Flex gap="2" wrap="wrap" align="center">
            {/* --- Select កម្រិតវប្បធម៌ ពី API --- */}
            <Select.Root value={degreeDraft} onValueChange={setDegreeDraft}>
              <Select.Trigger placeholder="កម្រិតវប្បធម៌" />
              <Select.Content>
                <Select.Item value="all">កម្រិតថ្នាក់ទាំងអស់</Select.Item>
                {academicLevels.map((level: any) => (
                  <Select.Item key={level.id} value={String(level.id)}>
                    {level.level}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* --- Select មហាវិទ្យាល័យ ពី API --- */}
            <Select.Root value={facultyDraft} onValueChange={setFacultyDraft}>
              <Select.Trigger placeholder="មហាវិទ្យាល័យ" />
              <Select.Content>
                <Select.Item value="all">មហាវិទ្យាល័យទាំងអស់</Select.Item>
                {faculties.map((f: any) => (
                  <Select.Item key={f.id} value={String(f.id)}>
                    {f.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Button
              onClick={handleApplyFilter}
              color="indigo"
              className="cursor-pointer"
            >
              <IoFilter /> ស្វែងរក
            </Button>
            <Button
              variant="soft"
              color="gray"
              onClick={handleClearFilter}
              className="cursor-pointer"
            >
              សម្អាត
            </Button>
          </Flex>
        </Flex>

        <FetchData isLoading={isLoading} error={error} data={teachersData}>
          <TeacherTable
            data={teachersData?.data || []}
            pageCount={pageCount}
            paginationState={{
              pageIndex: (page ?? 1) - 1,
              pageSize: limit ?? 10,
            }}
            onPaginationChange={onPaginationChange}
          />
        </FetchData>
      </Flex>
    </div>
  )
}

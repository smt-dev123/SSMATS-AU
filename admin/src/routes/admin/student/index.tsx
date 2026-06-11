import { getStudents } from '@/api/StudentAPI'
import { getFaculties } from '@/api/FacultyAPI'
import { getDepartments } from '@/api/DepartmentAPI'
import { getAcademicLevels } from '@/api/AcademicLevelAPI'
import { useTitle } from '@/hooks/useTitle'
import { Button, Flex, Select, Text, TextField, Box } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { IoSearch, IoFilter } from 'react-icons/io5'
import { useState, useEffect, useMemo } from 'react'
import { StudentTable } from '@/features/student/StudentTable'
import FetchData from '@/components/FetchData'
import StudentCreate from './-actions/Create'
import { useAcademicStore } from '@/stores/useAcademicStore'
import PDFDownload from '@/components/ui/PDFDownload'
import StudentReport from './-exports/ExportPDF'
import { useSessionContext } from '@/providers/AuthProvider'
import ExportExcel from './-exports/ExportExcel'

type StudentSearch = {
  name?: string
  facultyId?: string
  departmentId?: string
  academicLevelId?: string
  academicYearId?: string
  page?: number
  limit?: number
}

export const Route = createFileRoute('/admin/student/')({
  validateSearch: (search: Record<string, unknown>): StudentSearch => {
    return {
      name: (search.name as string) || '',
      facultyId: (search.facultyId as string) || 'all',
      departmentId: (search.departmentId as string) || 'all',
      academicLevelId: (search.academicLevelId as string) || 'all',
      academicYearId: (search.academicYearId as string) || undefined,
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 10,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  useTitle('គ្រប់គ្រងនិស្សិត')
  const { data: session } = useSessionContext()
  const role = (session?.user as any)?.role

  const { selectedYearId } = useAcademicStore()

  const { name, facultyId, departmentId, academicLevelId, page, limit } =
    Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [draft, setDraft] = useState<StudentSearch>({
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

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'students',
      selectedYearId,
      name,
      facultyId,
      departmentId,
      academicLevelId,
      page,
    ],
    queryFn: () =>
      getStudents(
        name,
        facultyId === 'all' ? '' : facultyId,
        departmentId === 'all' ? '' : departmentId,
        academicLevelId === 'all' ? '' : academicLevelId,
        selectedYearId,
        page,
        limit,
      ),
    enabled: !!selectedYearId,
  })

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
    navigate({ search: reset })
  }

  const students = useMemo(() => {
    if (!data) return []
    return (data as any)?.data || []
  }, [data])

  const total = (data as any)?.total || 0
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

  const filteredDepartments = useMemo(() => {
    if (draft.facultyId === 'all') return []
    return departments.filter(
      (d: any) => String(d.facultyId) === draft.facultyId,
    )
  }, [departments, draft.facultyId])

  return (
    <Flex direction="column" gap="4">
      {/* --- Header Section --- */}
      <Flex justify="between" align="center" mb="2">
        <Flex direction="column">
          <Text size="5" weight="bold">
            បញ្ជីរាយនាមនិស្សិត
          </Text>
        </Flex>
        <Flex gap="2">
          <PDFDownload
            document={<StudentReport data={students} />}
            fileName="student-report.pdf"
          />
          <ExportExcel data={students || []} />
          {['admin', 'manager', 'staff'].includes(role) && <StudentCreate />}
        </Flex>
      </Flex>

      {/* --- Filter Section --- */}
      <Flex justify="between" gap="3" wrap="wrap" align="end">
        <Box flexGrow="1" maxWidth="300px">
          <Text as="div" size="2" mb="1" weight="bold">
            ស្វែងរក
          </Text>
          <TextField.Root
            placeholder="ឈ្មោះ ឬ អត្តលេខ..."
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
          >
            <TextField.Slot>
              <IoSearch />
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <Flex gap="2" wrap="wrap" align="end">
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
              onValueChange={(val) => setDraft({ ...draft, departmentId: val })}
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

      {/* --- Table Section --- */}
      <FetchData isLoading={isLoading} error={error} data={data}>
        <StudentTable
          data={students}
          pageCount={pageCount}
          paginationState={{
            pageIndex: (page ?? 1) - 1,
            pageSize: limit ?? 10,
          }}
          onPaginationChange={onPaginationChange}
        />
      </FetchData>
    </Flex>
  )
}

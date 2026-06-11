import { Badge, Button, Flex, Text } from '@radix-ui/themes'
import { Link, useRouter } from '@tanstack/react-router'
import { FaArrowLeft, FaFileAlt, FaSave } from 'react-icons/fa'

interface AttendanceHeaderProps {
  selectedDate: string
  setSelectedDate: (date: string) => void
  selectedSession: number
  setSelectedSession: (session: number) => void
  canChangeDate: boolean
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  courseId: number
  role: string
  handleSubmit: () => void
  isPending: boolean
}

export const AttendanceHeader = ({
  selectedDate,
  setSelectedDate,
  selectedSession,
  setSelectedSession,
  canChangeDate,
  isEditing,
  setIsEditing,
  courseId,
  role,
  handleSubmit,
  isPending,
}: AttendanceHeaderProps) => {
  const router = useRouter()

  return (
    <Flex
      justify="between"
      align="center"
      className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <Flex gap="4" align="center">
        <button
          onClick={() => router.history.back()}
          className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600 dark:text-white" />
        </button>
        <Flex direction="column">
          <Text
            size="5"
            weight="bold"
            className="text-slate-800 dark:text-white"
          >
            សម្រង់វត្តមាននិស្សិត
          </Text>
        </Flex>
      </Flex>

      <Flex gap="3" align="center">
        <Flex align="center" gap="3">
          <Text size="2" weight="bold">
            កាលបរិច្ឆេទ៖
          </Text>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!canChangeDate}
            className={`p-1 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 ${!canChangeDate ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer'}`}
          />
          <Text size="2" weight="bold">
            Session:
          </Text>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(Number(e.target.value))}
            className={`p-1 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer`}
          >
            <option value={1}>Session 1</option>
            <option value={2}>Session 2</option>
          </select>
          {!canChangeDate && (
            <Badge color="yellow" variant="soft" size="1">
              ស្វ័យប្រវត្តិ
            </Badge>
          )}
        </Flex>
        {(role === 'admin' || role === 'manager') && (
          <Button
            variant="surface"
            color={isEditing ? 'red' : 'blue'}
            onClick={() => setIsEditing(!isEditing)}
            style={{ cursor: 'pointer' }}
          >
            {isEditing ? 'បោះបង់ការកែប្រែ' : 'កែប្រែវត្តមាន'}
          </Button>
        )}
        <Button variant="soft" color="gray" asChild>
          <Link
            to="/admin/course/attendance/report/$attendanceReportId"
            params={{ attendanceReportId: courseId.toString() }}
          >
            <FaFileAlt /> របាយការណ៍
          </Link>
        </Button>

        {role !== 'student' && (
          <Button
            size="2"
            color="blue"
            onClick={handleSubmit}
            loading={isPending}
            disabled={!isEditing}
            style={{ cursor: isEditing ? 'pointer' : 'not-allowed' }}
          >
            <FaSave /> រក្សាទុកទិន្នន័យ
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

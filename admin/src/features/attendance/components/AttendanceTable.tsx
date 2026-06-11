import {
  CellTable,
  HeaderTable,
  RootTable,
  RowTable,
} from '@/components/ui/tables/table'
import { Badge, Checkbox, Flex, Table } from '@radix-ui/themes'
import { STATUS_OPTIONS } from '../constants'

interface AttendanceTableProps {
  students: any[]
  activeStudents: any[]
  selected: Record<string, string>
  notes: Record<string, string>
  isEditing: boolean
  handleSelect: (studentId: string, status: string) => void
  handleSelectAll: (status: string) => void
  handleNoteChange: (studentId: string, note: string) => void
  course: any
}

export const AttendanceTable = ({
  students,
  activeStudents,
  selected,
  notes,
  isEditing,
  handleSelect,
  handleSelectAll,
  handleNoteChange,
  course,
}: AttendanceTableProps) => {
  return (
    <RootTable>
      <HeaderTable>
        <RowTable isHeader>
          <CellTable className="w-12 bg-gray-50" isHeader rowSpan={2}>
            ល.រ
          </CellTable>
          <CellTable className="w-28 bg-gray-50" isHeader rowSpan={2}>
            អត្តលេខ
          </CellTable>
          <CellTable className="bg-gray-50" isHeader rowSpan={2}>
            គោត្តនាម - នាម
          </CellTable>
          <CellTable className="bg-gray-50" isHeader rowSpan={2}>
            ឈ្មោះជាភាសាអង់គ្លេស
          </CellTable>
          <CellTable className="bg-gray-50" isHeader rowSpan={2}>
            ថ្ងៃខែឆ្នាំកំណើត
          </CellTable>
          <CellTable className="w-16 bg-gray-50" isHeader rowSpan={2}>
            ភេទ
          </CellTable>
          <CellTable className="w-28 bg-gray-50" isHeader rowSpan={2}>
            ស្ថានភាព
          </CellTable>
          <CellTable
            isHeader
            columSpan={5}
            noRightBorder
            className="bg-blue-600 border-blue-600"
          >
            ម៉ោងសិក្សា (
            {course?.schedule?.sessionTime?.firstSessionStartTime || 'TBA'} -{' '}
            {course?.schedule?.sessionTime?.secondSessionEndTime || 'TBA'})
          </CellTable>
        </RowTable>

        <RowTable isHeader>
          {STATUS_OPTIONS.map((opt, index) => (
            <CellTable
              key={opt.value}
              className="w-24 text-xs bg-blue-50 text-blue-800"
              isHeader
              noRightBorder={index === 3}
            >
              <Flex direction="column" align="center" gap="1">
                {opt.label}
                <Checkbox
                  size="1"
                  onCheckedChange={() => handleSelectAll(opt.value)}
                  checked={
                    activeStudents.length > 0 &&
                    activeStudents.every(
                      (s: any) => selected[s.id] === opt.value,
                    )
                  }
                />
              </Flex>
            </CellTable>
          ))}
          <CellTable
            className="w-48 text-xs bg-blue-50 text-blue-800"
            isHeader
            noRightBorder
          >
            សម្គាល់
          </CellTable>
        </RowTable>
      </HeaderTable>

      <Table.Body>
        {students.map((student: any, idx: number) => {
          const isInactive =
            !student.isActive || student.educationalStatus !== 'enrolled'
          return (
            <Table.Row
              key={student.id}
              className={`${isInactive ? 'bg-gray-50/50' : 'hover:bg-blue-50/30 transition-colors'}`}
            >
              <CellTable className="text-center">{idx + 1}</CellTable>
              <CellTable className="font-mono text-xs">
                {student.studentCode}
              </CellTable>
              <CellTable
                className={`text-left font-medium dark:text-white ${isInactive ? 'text-gray-400' : 'text-slate-700'}`}
              >
                {student.name}
              </CellTable>
              <CellTable
                className={`text-left font-medium dark:text-white ${isInactive ? 'text-gray-400' : 'text-slate-700'}`}
              >
                {student.nameEn}
              </CellTable>
              <CellTable className="text-center">{student.dob}</CellTable>
              <CellTable className="text-center">
                {student.gender === 'male'
                  ? 'ប្រុស'
                  : student.gender === 'female'
                    ? 'ស្រី'
                    : student.gender}
              </CellTable>
              <CellTable className="text-center">
                <Badge variant="soft" color={!isInactive ? 'blue' : 'red'}>
                  {!isInactive ? 'កំពុងសិក្សា' : student.educationalStatus}
                </Badge>
              </CellTable>

              {STATUS_OPTIONS.map((opt, index) => (
                <CellTable
                  key={opt.value}
                  className="text-center"
                  noRightBorder={index === 3}
                >
                  <Checkbox
                    disabled={isInactive || !isEditing}
                    checked={selected[student.id] === opt.value}
                    onCheckedChange={() => handleSelect(student.id, opt.value)}
                    color={opt.color as any}
                  />
                </CellTable>
              ))}
              <CellTable className="text-center" noRightBorder>
                <input
                  type="text"
                  value={notes[student.id] || ''}
                  onChange={(e) => handleNoteChange(student.id, e.target.value)}
                  disabled={isInactive || !isEditing}
                  placeholder="..."
                  className={`w-full p-1 text-xs border rounded transition-all ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : 'bg-white border-gray-200 focus:border-blue-500'}`}
                />
              </CellTable>
            </Table.Row>
          )
        })}
      </Table.Body>
    </RootTable>
  )
}

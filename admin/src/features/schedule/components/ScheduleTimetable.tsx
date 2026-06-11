import { Badge, Box, Flex, Text } from '@radix-ui/themes'
import {
  BodyTable,
  CellTable,
  HeaderTable,
  RootTable,
  RowTable,
} from '@/components/ui/tables/table'
import { DAYS_OF_WEEK } from '../constants'

interface ScheduleTimetableProps {
  schedule: any
}

export function ScheduleTimetable({ schedule }: ScheduleTimetableProps) {
  const coursesByDay =
    schedule.courses?.reduce((acc: any, course: any) => {
      const dayKey = course.day.toLowerCase()
      if (!acc[dayKey]) acc[dayKey] = []
      acc[dayKey].push(course)
      return acc
    }, {}) || {}

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <div className="min-w-[1000px]">
        <RootTable>
          <HeaderTable>
            <RowTable isHeader>
              <CellTable
                isHeader
                className="w-32 bg-gray-50 text-center py-4 border-b"
              >
                <Text size="2" weight="bold" color="indigo">
                  ម៉ោងសិក្សា
                </Text>
              </CellTable>
              {DAYS_OF_WEEK.map((day) => (
                <CellTable
                  key={day.key}
                  isHeader
                  className="text-center bg-gray-50 border-l border-b border-gray-200/50 py-4"
                >
                  <Text size="2" weight="bold" color="indigo">
                    {day.label}
                  </Text>
                  <Text
                    size="1"
                    className="block text-gray-400 uppercase font-mono tracking-tighter"
                  >
                    {day.key}
                  </Text>
                </CellTable>
              ))}
            </RowTable>
          </HeaderTable>

          <BodyTable>
            <RowTable>
              {/* Session Time Column */}
              <CellTable className="bg-gray-50/30 text-center border-r border-gray-100">
                <Box py="4">
                  <Flex direction="column" gap="1">
                    <Text
                      size="2"
                      color="indigo"
                      weight="bold"
                      className="font-mono"
                    >
                      {schedule.sessionTime?.firstSessionStartTime} -{' '}
                      {schedule.sessionTime?.firstSessionEndTime}
                    </Text>
                    <div className="h-px bg-gray-200 w-8 mx-auto my-1" />
                    <Text
                      size="2"
                      color="indigo"
                      weight="bold"
                      className="font-mono"
                    >
                      {schedule.sessionTime?.secondSessionStartTime} -{' '}
                      {schedule.sessionTime?.secondSessionEndTime}
                    </Text>
                  </Flex>
                </Box>
              </CellTable>

              {/* Courses Columns */}
              {DAYS_OF_WEEK.map((day) => {
                const dayCourses = coursesByDay?.[day.key] || []
                const course = dayCourses[0]

                return (
                  <CellTable
                    key={day.key}
                    className="p-4 align-top border-l border-gray-100 group transition-colors hover:bg-blue-50/30 min-h-[140px]"
                  >
                    {course ? (
                      <Flex
                        direction="column"
                        justify="between"
                        className="h-full min-h-[100px]"
                      >
                        <Box>
                          <Text
                            weight="bold"
                            size="3"
                            className="text-slate-800 leading-snug block mb-1 group-hover:text-blue-600 dark:text-slate-200 transition-colors"
                          >
                            {course.name}
                          </Text>
                          <Badge
                            size="1"
                            color="indigo"
                            variant="surface"
                            className="font-mono"
                          >
                            {course.code}
                          </Badge>
                        </Box>

                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                          <Text
                            size="2"
                            className="font-semibold text-slate-600 block"
                          >
                            {course.teacher?.name || 'គ្រូឧទ្ទេស'}
                          </Text>
                          {course.teacher?.phone && (
                            <Text
                              size="1"
                              className="text-gray-500 font-mono italic"
                            >
                              {course.teacher.phone}
                            </Text>
                          )}
                        </div>
                      </Flex>
                    ) : (
                      <Flex
                        align="center"
                        justify="center"
                        className="h-full opacity-50 italic"
                      >
                        <Text size="1">គ្មានម៉ោង</Text>
                      </Flex>
                    )}
                  </CellTable>
                )
              })}
            </RowTable>
          </BodyTable>
        </RootTable>
      </div>
    </div>
  )
}

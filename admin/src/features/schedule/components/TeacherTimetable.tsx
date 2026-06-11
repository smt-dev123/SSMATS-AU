import { Badge, Box, Flex, Text } from '@radix-ui/themes'
import {
  BodyTable,
  CellTable,
  HeaderTable,
  RootTable,
  RowTable,
} from '@/components/ui/tables/table'
import { DAYS_OF_WEEK } from '../constants'
import type { CoursesType } from '@/types'

interface TeacherTimetableProps {
  courses: CoursesType[]
}

export function TeacherTimetable({ courses }: TeacherTimetableProps) {
  // Group courses by shift (morning, evening, night)
  // For a teacher, they might teach in different shifts across different days
  
  // Get unique session times across all courses
  const uniqueSessionTimes = Array.from(
    new Map(
      courses
        .filter((c) => c.schedule?.sessionTime)
        .map((c) => [c.schedule!.sessionTime!.id, c.schedule!.sessionTime]),
    ).values(),
  ).sort((a: any, b: any) => {
    // Sort shifts: morning -> evening -> night
    const order = { morning: 1, evening: 2, night: 3 }
    const shiftA = order[a.shift as keyof typeof order] || 4
    const shiftB = order[b.shift as keyof typeof order] || 4
    return shiftA - shiftB
  })

  // Helper to find a course in a specific session time and day
  const getCoursesForSessionAndDay = (sessionTimeId: number, dayKey: string) => {
    return courses.filter(
      (c) =>
        c.schedule?.sessionTimeId === sessionTimeId &&
        c.day.toLowerCase() === dayKey.toLowerCase(),
    )
  }

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
                  ម៉ោង/វេនសិក្សា
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
            {uniqueSessionTimes.length === 0 ? (
              <RowTable>
                <CellTable columSpan={DAYS_OF_WEEK.length + 1} className="py-8 text-center">
                  <Text color="gray">មិនមានកាលវិភាគបង្រៀនទេ</Text>
                </CellTable>
              </RowTable>
            ) : (
              uniqueSessionTimes.map((session: any) => (
                <RowTable key={session.id}>
                  {/* Session Time Column */}
                  <CellTable className="bg-gray-50/30 text-center border-r border-gray-100 border-b">
                    <Box py="4">
                      <Flex direction="column" gap="1" align="center">
                        <Badge color={session.shift === 'morning' ? 'blue' : session.shift === 'evening' ? 'orange' : 'indigo'} mb="2">
                           {session.shift === 'morning' ? 'ព្រឹក' : session.shift === 'evening' ? 'ល្ងាច' : 'យប់'}
                        </Badge>
                        <Text
                          size="2"
                          color="indigo"
                          weight="bold"
                          className="font-mono text-center"
                        >
                          {session.firstSessionStartTime} -{' '}
                          {session.firstSessionEndTime}
                        </Text>
                        <div className="h-px bg-gray-200 w-8 mx-auto my-1" />
                        <Text
                          size="2"
                          color="indigo"
                          weight="bold"
                          className="font-mono text-center"
                        >
                          {session.secondSessionStartTime} -{' '}
                          {session.secondSessionEndTime}
                        </Text>
                      </Flex>
                    </Box>
                  </CellTable>

                  {/* Courses Columns for this session time */}
                  {DAYS_OF_WEEK.map((day) => {
                    const dayCourses = getCoursesForSessionAndDay(session.id, day.key)

                    return (
                      <CellTable
                        key={day.key}
                        className="p-4 align-top border-l border-b border-gray-100 group transition-colors hover:bg-blue-50/30 min-h-[140px]"
                      >
                        {dayCourses.length > 0 ? (
                          <Flex direction="column" gap="4" className="h-full">
                            {dayCourses.map((course, idx) => (
                              <Flex
                                key={course.id || idx}
                                direction="column"
                                justify="between"
                                className={`min-h-[100px] ${idx > 0 ? 'pt-4 border-t border-dashed border-gray-200' : ''}`}
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
                                    className="font-mono mb-2"
                                  >
                                    {course.code}
                                  </Badge>
                                </Box>

                                <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
                                  <Text
                                    size="2"
                                    className="font-semibold text-slate-600 block"
                                  >
                                    {course.schedule?.faculty?.name} / {course.schedule?.department?.name}
                                  </Text>
                                  <Text size="1" className="text-gray-500 block">
                                    ជំនាន់ {course.schedule?.generation} (ឆ្នាំ {course.schedule?.year})
                                  </Text>
                                  <Text size="1" className="text-gray-500 font-mono italic">
                                    បន្ទប់: {course.schedule?.classroom?.name}
                                  </Text>
                                </div>
                              </Flex>
                            ))}
                          </Flex>
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            className="h-full opacity-50 italic"
                          >
                            <Text size="1">---</Text>
                          </Flex>
                        )}
                      </CellTable>
                    )
                  })}
                </RowTable>
              ))
            )}
          </BodyTable>
        </RootTable>
      </div>
    </div>
  )
}

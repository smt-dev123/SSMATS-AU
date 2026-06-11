import { Badge, Card, Flex, Text } from '@radix-ui/themes'
import { FaChalkboardTeacher, FaDoorOpen } from 'react-icons/fa'

interface ScheduleInfoCardProps {
  schedule: any
  selectedYearName?: string
}

export function ScheduleInfoCard({
  schedule,
  selectedYearName,
}: ScheduleInfoCardProps) {
  return (
    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-800 dark:to-indigo-900 p-6 md:p-8 rounded-3xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
        <FaChalkboardTeacher size={120} />
      </div>
      <Flex direction="column" gap="2" className="relative z-10">
        <Badge variant="surface" color="blue" size="2" className="w-fit mb-2">
          {selectedYearName}
        </Badge>
        <Text
          size={{ initial: '5', md: '7' }}
          weight="bold"
          className="tracking-tight"
        >
          កាលវិភាគសិក្សា {schedule.academicLevel?.level || 'បរិញ្ញាបត្រ'}
        </Text>
        <Flex
          gap="4"
          align="center"
          wrap="wrap"
          className="text-blue-100 text-sm"
        >
          <Text weight="medium">ជំនាន់ទី {schedule.generation}</Text>
          <Text className="hidden sm:inline">•</Text>
          <Text>
            ឆ្នាំទី {schedule.year} ឆមាស {schedule.semester}
          </Text>
          <Text className="hidden sm:inline">•</Text>
          <Badge color="blue" variant="surface" className="uppercase font-bold">
            {schedule.studyShift === 'morning' ? 'វេនព្រឹក' : 'វេនយប់'}
          </Badge>
        </Flex>
        <Flex
          gap="4"
          mt="4"
          wrap="wrap"
          className="bg-white/10 p-3 rounded-xl w-fit border border-white/20"
        >
          <Flex align="center" gap="2" className="text-sm">
            <FaDoorOpen size={14} /> បន្ទប់៖ {schedule.classroom?.name || 'TBA'}
          </Flex>
          <Flex align="center" gap="2" className="text-sm">
            📍 អាគារ៖ {schedule.classroom?.building?.name || 'AU'}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}

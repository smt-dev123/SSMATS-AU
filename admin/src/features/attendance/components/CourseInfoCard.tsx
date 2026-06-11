import { Flex, Text } from '@radix-ui/themes'

interface CourseInfoCardProps {
  course: any
}

export const CourseInfoCard = ({ course }: CourseInfoCardProps) => {
  return (
    <Flex
      direction="column"
      gap="1"
      className="text-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700"
    >
      <Text size="4" weight="bold" className="text-slate-800 dark:text-white">
        {course?.schedule?.academicLevel?.level === 'Bachelor'
          ? 'ថ្នាក់បរិញ្ញាបត្រ'
          : course?.schedule?.academicLevel?.level === 'Associate'
            ? 'ថ្នាក់បរិញ្ញាបត្ររង'
            : course?.schedule?.academicLevel?.level === 'Master'
              ? 'ថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់'
              : course?.schedule?.academicLevel?.level === 'PhD'
                ? 'ថ្នាក់បណ្ឌិត'
                : ''}{' '}
        {course?.schedule?.faculty?.name || '...'}
      </Text>
      <Flex
        gap="4"
        justify="center"
        className="text-blue-700/80 text-sm italic"
      >
        <Text>
          ជំនាន់ទី{course?.schedule?.generation || '--'} ឆ្នាំទី
          {course?.schedule?.year || '--'} ឆមាស
          {course?.schedule?.semester || '--'}
        </Text>
        <Text>|</Text>
        <Text>
          វេន៖{' '}
          {course?.schedule?.studyShift === 'morning'
            ? 'ព្រឹក'
            : course?.schedule?.studyShift === 'evening'
              ? 'ល្ងាច'
              : 'យប់'}
        </Text>
        <Text>|</Text>
        <Text>កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('kh-KH')}</Text>
      </Flex>
    </Flex>
  )
}

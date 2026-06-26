import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import type {ColumnDefinition} from '@/utils/excel_report_helper';
import {
  
  generateExcelReport
} from '@/utils/excel_report_helper'

interface ExportAttendanceExcelProps {
  course: any
  students: Array<any>
}

const ExportAttendanceExcel = ({
  course,
  students,
}: ExportAttendanceExcelProps) => {
  const handleExportExcel = async () => {
    if (!students || students.length === 0) {
      alert('មិនមានទិន្នន័យសម្រាប់ Export ទេ')
      return
    }

    const columns: Array<ColumnDefinition> = [
      { header: 'ល.រ', width: 8, transform: (_, index) => index + 1 },
      { header: 'ឈ្មោះនិស្សិត', width: 30, key: 'name' },
      {
        header: 'ភេទ',
        width: 10,
        transform: (s) =>
          s.gender === 'male'
            ? 'ប្រុស'
            : s.gender === 'female'
              ? 'ស្រី'
              : s.gender,
      },
      { header: 'លេខទូរស័ព្ទ', width: 20, key: 'phone' },
      { header: 'ស្ថានភាព', width: 15, key: 'status' },
      { header: 'ច្បាប់', width: 10, key: 'leave' },
      { header: 'អវត្តមាន', width: 12, key: 'absent' },
      {
        header: 'សរុប',
        width: 10,
        transform: (s) => Number(s.leave || 0) + Number(s.absent || 0),
      },
      {
        header: 'ភាគរយ',
        width: 12,
        transform: (s) => {
          const totalAbsent = Number(s.leave || 0) + Number(s.absent || 0)
          return String(s.status || '').toLowerCase() === 'dropped out'
            ? '0%'
            : `${Math.max(0, 100 - totalAbsent * 5)}%`
        },
      },
      { header: 'ពិន្ទុវត្តមាន', width: 15, key: 'score' },
    ]

    await generateExcelReport({
      title: 'របាយការណ៍វត្តមាន និងពិន្ទុប្រចាំឆមាស',
      data: students,
      columns,
      fileName: `វត្តមាន_${course?.name || ''}`,
      sheetName: 'របាយការណ៍វត្តមាន',
      additionalInfo: [
        {
          label: 'មុខជំនាញ',
          value: course?.schedule?.department?.name || '--',
        },
        { label: 'ឆ្នាំទី', value: course?.schedule?.year || '--' },
        { label: 'ឆមាសទី', value: course?.schedule?.semester || '--' },
        { label: 'មុខវិជ្ជា', value: course?.name || '--' },
      ],
    })
  }

  return (
    <Button
      variant="soft"
      color="green"
      onClick={handleExportExcel}
      style={{ cursor: 'pointer' }}
    >
      <FaFileExcel /> Export Excel
    </Button>
  )
}

export default ExportAttendanceExcel

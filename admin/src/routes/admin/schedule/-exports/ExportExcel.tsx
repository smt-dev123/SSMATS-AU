import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import type { ScheduleType } from '@/types'
import type {ColumnDefinition} from '@/utils/excel_report_helper';
import {
  
  generateExcelReport
} from '@/utils/excel_report_helper'

interface ExportExcelProps {
  data: Array<ScheduleType>
}

const ExportExcel = ({ data }: ExportExcelProps) => {
  const handleExportExcel = async () => {
    if (!data || data.length === 0) {
      alert('មិនមានទិន្នន័យសម្រាប់ Export ទេ')
      return
    }

    const columns: Array<ColumnDefinition> = [
      { header: 'ល.រ', width: 8, transform: (_, index) => index + 1 },
      { header: 'មហាវិទ្យាល័យ', width: 25, key: 'faculty.name' },
      { header: 'ដេប៉ាតឺម៉ង់', width: 25, key: 'department.name' },
      { header: 'កម្រិត', width: 15, key: 'academicLevel.level' },
      { header: 'ជំនាន់', width: 10, key: 'generation' },
      { header: 'ឆ្នាំ', width: 10, key: 'year' },
      { header: 'ឆមាស', width: 10, key: 'semester' },
      {
        header: 'វេន',
        width: 15,
        transform: (item) =>
          item.sessionTime?.shift === 'morning'
            ? 'ព្រឹក'
            : item.sessionTime?.shift === 'evening'
              ? 'ល្ងាច'
              : item.sessionTime?.shift === 'night'
                ? 'យប់'
                : '',
      },
      { header: 'បន្ទប់', width: 15, key: 'classroom.name' },
      { header: 'ឆ្នាំសិក្សា', width: 20, key: 'academicYear.name' },
    ]

    await generateExcelReport({
      title: 'បញ្ជីកាលវិភាគសិក្សា',
      data,
      columns,
      fileName: 'បញ្ជីកាលវិភាគសិក្សា',
      sheetName: 'បញ្ជីកាលវិភាគ',
    })
  }

  return (
    <Button
      variant="soft"
      color="green"
      onClick={handleExportExcel}
      style={{ cursor: 'pointer' }}
    >
      <FaFileExcel />
      Export Excel
    </Button>
  )
}

export default ExportExcel

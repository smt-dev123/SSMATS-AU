import type { StudentsType } from '@/types'
import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import { generateExcelReport, type ColumnDefinition } from '@/utils/excel_report_helper'

interface ExportExcelProps {
  data: StudentsType[]
}

const ExportExcel = ({ data }: ExportExcelProps) => {
  const handleExportExcel = async () => {
    if (!data || data.length === 0) {
      alert('មិនមានទិន្នន័យសម្រាប់ Export ទេ')
      return
    }

    const columns: ColumnDefinition[] = [
      { header: 'ល.រ', width: 8, transform: (_, index) => index + 1 },
      { header: 'ឈ្មោះភាសាខ្មែរ', width: 25, key: 'name' },
      { header: 'ឈ្មោះភាសាអង់គ្លេស', width: 25, key: 'nameEn' },
      {
        header: 'ភេទ',
        width: 10,
        transform: (item) =>
          item.gender === 'male' ? 'ប' : item.gender === 'female' ? 'ស' : item.gender || '',
      },
      { header: 'លេខទូរស័ព្ទ', width: 20, key: 'phone' },
      { header: 'អាស័យដ្ឋាន', width: 35, key: 'address' },
    ]

    await generateExcelReport({
      title: 'បញ្ជីរាយនាមនិស្សិត',
      data,
      columns,
      fileName: 'បញ្ជីនិស្សិត',
      sheetName: 'បញ្ជីនិស្សិត',
      additionalInfo: [
        { label: 'មុខជំនាញ', value: data[0]?.skill?.name || '' },
        { label: 'ឆ្នាំសិក្សា', value: data[0]?.academicYear?.name || '' },
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
      <FaFileExcel />
      Export Excel
    </Button>
  )
}

export default ExportExcel
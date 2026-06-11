import type { TeachersType } from '@/types'
import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import { generateExcelReport, type ColumnDefinition } from '@/utils/excel_report_helper'

interface ExportExcelProps {
  data: TeachersType[]
}

const ExportExcel = ({ data }: ExportExcelProps) => {
  const handleExportExcel = async () => {
    if (!data || data.length === 0) {
      alert('មិនមានទិន្នន័យសម្រាប់ Export ទេ')
      return
    }

    const columns: ColumnDefinition[] = [
      { header: 'ល.រ', width: 8, transform: (_, index) => index + 1 },
      { header: 'លេខសម្គាល់គ្រូ', width: 20, key: 'teacherCode' },
      { header: 'គោត្តនាម-នាម', width: 25, key: 'name' },
      {
        header: 'ភេទ',
        width: 10,
        transform: (item) =>
          item.gender === 'male' ? 'ប' : item.gender === 'female' ? 'ស' : item.gender || '',
      },
      { header: 'មហាវិទ្យាល័យ', width: 25, key: 'faculty.name' },
      { header: 'លេខទូរស័ព្ទ', width: 20, key: 'phone' },
      { header: 'អ៊ីម៉ែល', width: 25, key: 'email' },
      { header: 'អាស័យដ្ឋាន', width: 35, key: 'address' },
    ]

    await generateExcelReport({
      title: 'បញ្ជីរាយនាមសាស្រ្ដាចារ្យ',
      data,
      columns,
      fileName: 'បញ្ជីសាស្រ្ដាចារ្យ',
      sheetName: 'បញ្ជីសាស្រ្ដាចារ្យ',
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

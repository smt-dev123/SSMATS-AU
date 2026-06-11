import type { BuildingType } from '@/types'
import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import * as XLSX from 'xlsx'

const ExportExcel = ({ data }: { data: BuildingType[] }) => {
  const handleExportExcel = () => {
    if (!data) return
    try {
      const formattedData = data.map((item: BuildingType, index: number) => ({
        'ល.រ': index + 1,
        អាគារសិក្សា: item.name,
        ការពិពណ៌នា: item.description || '',
      }))

      const worksheet = XLSX.utils.json_to_sheet(formattedData)
      const workbook = XLSX.utils.book_new()
      const fileName = `តារាងអាគារសិក្សា_${new Date().toLocaleDateString('kh-KH')}.xlsx`
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Buildings')
      XLSX.writeFile(workbook, fileName)
    } catch (err) {
      console.error(err)
      alert('មានបញ្ហាក្នុងការ Export Excel')
    }
  }
  return (
    <Button
      variant="soft"
      onClick={handleExportExcel}
      style={{ cursor: 'pointer' }}
      color="green"
    >
      <FaFileExcel />
      Export Excel
    </Button>
  )
}

export default ExportExcel

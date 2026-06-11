import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import getBase64FromUrl from '@/utils/image_base64'
import Logo from '@/assets/au.png'

interface ExportTimetableExcelProps {
  schedule: any
}

const toKhmerNum = (num: number | string | undefined | null) => {
  if (num === undefined || num === null) return ''
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
  return num.toString().split('').map(d => /[0-9]/.test(d) ? khmerNumbers[parseInt(d)] : d).join('')
}

const getKhmerDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
  return `ថ្ងៃទី${toKhmerNum(date.getDate())} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${toKhmerNum(date.getFullYear())}`
}

const ExportTimetableExcel = ({ schedule }: ExportTimetableExcelProps) => {
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('កាលវិភាគ')

      const columnsCount = 8
      const lastColLetter = 'H'

      worksheet.columns = [
        { width: 16 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
      ]

      try {
        const base64 = await getBase64FromUrl(Logo)
        const imageId = workbook.addImage({
          base64: base64,
          extension: 'png',
        })
        worksheet.addImage(imageId, {
          tl: { col: 1.5, row: 1.2 },
          ext: { width: 70, height: 70 },
        })
      } catch (e) {
        console.error('Logo Error:', e)
      }

      // Headers
      worksheet.mergeCells(`A1:${lastColLetter}1`)
      const countryCell = worksheet.getCell('A1')
      countryCell.value = 'ព្រះរាជាណាចក្រកម្ពុជា'
      countryCell.font = { name: 'Khmer OS Muol Light', size: 11 }
      countryCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A2:${lastColLetter}2`)
      const mottoCell = worksheet.getCell('A2')
      mottoCell.value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ'
      mottoCell.font = { name: 'Khmer OS Muol Light', size: 10 }
      mottoCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A3:${lastColLetter}3`)
      const symbolCell = worksheet.getCell('A3')
      symbolCell.value = '3'
      symbolCell.font = { name: 'Tacteing', size: 24 }
      symbolCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells('A5:C5')
      const uniCell = worksheet.getCell('A5')
      uniCell.value = 'សាកលវិទ្យាល័យអង្គរ'
      uniCell.font = { name: 'Khmer OS Muol Light', size: 10 }
      uniCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells('A6:C6')
      const refCell = worksheet.getCell('A6')
      refCell.value = 'លេខ:.......................ស.អ.'
      refCell.font = { name: 'Khmer OS Battambang', size: 11 }
      refCell.alignment = { horizontal: 'center' }

      const academicLevelText = schedule?.academicLevel?.level || 'បរិញ្ញាបត្រ'
      
      worksheet.mergeCells(`A7:${lastColLetter}7`)
      const titleCell = worksheet.getCell('A7')
      titleCell.value = `កាលវិភាគសិក្សាថ្នាក់${academicLevelText}`
      titleCell.font = { name: 'Khmer OS Muol Light', size: 11 }
      titleCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A8:${lastColLetter}8`)
      const subTitleCell = worksheet.getCell('A8')
      subTitleCell.value = `ជំនាន់ទី${toKhmerNum(schedule?.generation)} ឆ្នាំទី${toKhmerNum(schedule?.year)} ឆមាសទី${toKhmerNum(schedule?.semester)} ឆ្នាំសិក្សា${toKhmerNum(schedule?.academicYear?.name)}`
      subTitleCell.font = { name: 'Khmer OS Muol Light', size: 10 }
      subTitleCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A9:${lastColLetter}9`)
      const majorCell = worksheet.getCell('A9')
      majorCell.value = `មុខជំនាញ ៖ ${schedule?.department?.name || ''}`
      majorCell.font = { name: 'Khmer OS Muol Light', size: 10 }
      majorCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A10:${lastColLetter}10`)
      const dateCellHeader = worksheet.getCell('A10')
      dateCellHeader.value = `ចាប់ផ្ដើមពី${getKhmerDate(schedule?.semesterStart)} បញ្ចប់ត្រឹម ${getKhmerDate(schedule?.semesterEnd)}`
      dateCellHeader.font = { name: 'Khmer OS Battambang', size: 10 }
      dateCellHeader.alignment = { horizontal: 'center' }

      const shiftText = schedule?.sessionTime?.shift === 'morning' ? 'ព្រឹក' : schedule?.sessionTime?.shift === 'evening' ? 'ល្ងាច' : schedule?.sessionTime?.shift === 'night' ? 'យប់' : ''
      worksheet.mergeCells(`A11:${lastColLetter}11`)
      const roomCell = worksheet.getCell('A11')
      roomCell.value = `វេនសិក្សា ៖ ${shiftText} បន្ទប់ ៖ ${schedule?.classroom?.name || ''}`
      roomCell.font = { name: 'Khmer OS Battambang', size: 10 }
      roomCell.alignment = { horizontal: 'center' }

      const days = [
        { key: 'monday', label: 'ចន្ទ' },
        { key: 'tuesday', label: 'អង្គារ' },
        { key: 'wednesday', label: 'ពុធ' },
        { key: 'thursday', label: 'ព្រហស្បតិ៍' },
        { key: 'friday', label: 'សុក្រ' },
        { key: 'saturday', label: 'សៅរ៍' },
        { key: 'sunday', label: 'អាទិត្យ' },
      ]

      const headerRowIndex = 13
      const headerRow = worksheet.getRow(headerRowIndex)
      headerRow.values = ['Sessions/ម៉ោង', ...days.map(d => d.label)]

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        }
        cell.font = { name: 'Khmer OS Muol Light', size: 10 }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })

      const courses = schedule?.courses || []

      // Session 1
      const s1RowIndex = 14
      const s1Row = worksheet.getRow(s1RowIndex)
      s1Row.height = 70
      
      const s1Cell = s1Row.getCell(1)
      s1Cell.value = `Session 1\n${schedule?.sessionTime?.firstSessionStartTime}-${schedule?.sessionTime?.firstSessionEndTime}`
      s1Cell.font = { name: 'Khmer OS Battambang', size: 10 }
      s1Cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }
      s1Cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

      days.forEach((day, index) => {
        const cell = s1Row.getCell(index + 2)
        const course = courses.find((c: any) => c.day.toLowerCase() === day.key)
        if (course) {
          cell.value = `${course.name}\nល. ${course.teacher?.name}\n${course.teacher?.phone || ''}`
        }
        cell.font = { name: 'Khmer OS Battambang', size: 10 }
        cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      // Session 2
      const s2RowIndex = 15
      const s2Row = worksheet.getRow(s2RowIndex)
      s2Row.height = 70

      const s2Cell = s2Row.getCell(1)
      s2Cell.value = `Session 2\n${schedule?.sessionTime?.secondSessionStartTime}-${schedule?.sessionTime?.secondSessionEndTime}`
      s2Cell.font = { name: 'Khmer OS Battambang', size: 10 }
      s2Cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }
      s2Cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

      days.forEach((day, index) => {
        const cell = s2Row.getCell(index + 2)
        const course = courses.find((c: any) => c.day.toLowerCase() === day.key)
        if (course) {
          cell.value = `${course.name}\nល. ${course.teacher?.name}\n${course.teacher?.phone || ''}`
        }
        cell.font = { name: 'Khmer OS Battambang', size: 10 }
        cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      const footerRowIndex = 17
      worksheet.mergeCells(`A${footerRowIndex}:C${footerRowIndex}`)
      const sign1Cell = worksheet.getCell(`A${footerRowIndex}`)
      sign1Cell.value = 'បានឃើញ និងឯកភាព\nសាកលវិទ្យាធិការ'
      sign1Cell.font = { name: 'Khmer OS Muol Light', size: 10 }
      sign1Cell.alignment = { horizontal: 'center', wrapText: true }

      worksheet.mergeCells(`D${footerRowIndex}:E${footerRowIndex}`)
      const sign2Cell = worksheet.getCell(`D${footerRowIndex}`)
      sign2Cell.value = 'បានពិនិត្យ និងឯកភាព\nសាកលវិទ្យាធិការរង'
      sign2Cell.font = { name: 'Khmer OS Muol Light', size: 10 }
      sign2Cell.alignment = { horizontal: 'center', wrapText: true }

      worksheet.mergeCells(`F${footerRowIndex}:H${footerRowIndex}`)
      const sign3Cell = worksheet.getCell(`F${footerRowIndex}`)
      sign3Cell.value = 'ក្រុងសៀមរាប ថ្ងៃទី........ ខែ........... ឆ្នាំ............\nរៀបចំដោយ\nប្រធាន ក.ស.រ'
      sign3Cell.font = { name: 'Khmer OS Muol Light', size: 10 }
      sign3Cell.alignment = { horizontal: 'center', wrapText: true }

      const buffer = await workbook.xlsx.writeBuffer()
      const finalFileName = `កាលវិភាគ_${schedule?.id || ''}_${new Date().getTime()}.xlsx`
      saveAs(new Blob([buffer]), finalFileName)
    } catch (error) {
      console.error('Export Excel Error:', error)
      alert('មានបញ្ហាក្នុងការ Export Excel')
    }
  }

  return (
    <Button
      variant="soft"
      color="green"
      onClick={handleExportExcel}
      style={{ cursor: 'pointer' }}
    >
      <FaFileExcel />
      <span className="hidden md:inline">Export Excel</span>
    </Button>
  )
}

export default ExportTimetableExcel

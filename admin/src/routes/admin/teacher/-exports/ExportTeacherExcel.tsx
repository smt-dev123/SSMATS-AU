import { Button } from '@radix-ui/themes'
import { FaFileExcel } from 'react-icons/fa'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import getBase64FromUrl from '@/utils/image_base64'
import Logo from '@/assets/au.png'
import { DAYS_OF_WEEK } from '@/features/schedule/constants'

interface ExportTeacherExcelProps {
  teacher: any
  courses: any[]
}

const toKhmerNum = (num: number | string | undefined | null) => {
  if (num === undefined || num === null) return ''
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
  return num
    .toString()
    .split('')
    .map((d) => (/[0-9]/.test(d) ? khmerNumbers[parseInt(d)] : d))
    .join('')
}

const ExportTeacherExcel = ({ teacher, courses }: ExportTeacherExcelProps) => {
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('កាលវិភាគបង្រៀន')

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

      worksheet.mergeCells(`A7:${lastColLetter}7`)
      const titleCell = worksheet.getCell('A7')
      titleCell.value = `កាលវិភាគបង្រៀន`
      titleCell.font = { name: 'Khmer OS Muol Light', size: 11 }
      titleCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A8:${lastColLetter}8`)
      const subTitleCell = worksheet.getCell('A8')
      subTitleCell.value = `ឈ្មោះគ្រូបង្រៀន៖ ${teacher?.name || ''}`
      subTitleCell.font = { name: 'Khmer OS Muol Light', size: 10 }
      subTitleCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells(`A9:${lastColLetter}9`)
      const contactCell = worksheet.getCell('A9')
      contactCell.value = `លេខទូរស័ព្ទ៖ ${teacher?.phone || ''} | អ៊ីមែល៖ ${teacher?.email || ''}`
      contactCell.font = { name: 'Khmer OS Battambang', size: 10 }
      contactCell.alignment = { horizontal: 'center' }

      const headerRowIndex = 11
      const headerRow = worksheet.getRow(headerRowIndex)
      headerRow.values = ['ម៉ោង/វេនសិក្សា', ...DAYS_OF_WEEK.map((d) => d.label)]

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

      const uniqueSessionTimes = Array.from(
        new Map(
          courses
            .filter((c) => c.schedule?.sessionTime)
            .map((c) => [c.schedule!.sessionTime!.id, c.schedule!.sessionTime]),
        ).values(),
      ).sort((a: any, b: any) => {
        const order = { morning: 1, evening: 2, night: 3 }
        const shiftA = order[a.shift as keyof typeof order] || 4
        const shiftB = order[b.shift as keyof typeof order] || 4
        return shiftA - shiftB
      })

      let currentRowIndex = headerRowIndex + 1

      if (uniqueSessionTimes.length === 0) {
        worksheet.mergeCells(`A${currentRowIndex}:${lastColLetter}${currentRowIndex}`)
        const emptyCell = worksheet.getCell(`A${currentRowIndex}`)
        emptyCell.value = 'មិនមានកាលវិភាគបង្រៀនទេ'
        emptyCell.font = { name: 'Khmer OS Battambang', size: 10 }
        emptyCell.alignment = { horizontal: 'center', vertical: 'middle' }
        currentRowIndex++
      }

      uniqueSessionTimes.forEach((session: any) => {
        const row = worksheet.getRow(currentRowIndex)
        row.height = 70

        const sessionCell = row.getCell(1)
        const shiftStr = session.shift === 'morning' ? 'ព្រឹក' : session.shift === 'evening' ? 'ល្ងាច' : 'យប់'
        sessionCell.value = `${shiftStr}\n${session.firstSessionStartTime}-${session.firstSessionEndTime}\n${session.secondSessionStartTime}-${session.secondSessionEndTime}`
        sessionCell.font = { name: 'Khmer OS Battambang', size: 10 }
        sessionCell.alignment = {
          wrapText: true,
          horizontal: 'center',
          vertical: 'middle',
        }
        sessionCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        DAYS_OF_WEEK.forEach((day, index) => {
          const cell = row.getCell(index + 2)
          const dayCourses = courses.filter(
            (c) =>
              c.schedule?.sessionTimeId === session.id &&
              c.day.toLowerCase() === day.key.toLowerCase(),
          )
          if (dayCourses.length > 0) {
            cell.value = dayCourses
              .map(
                (c) =>
                  `${c.name}\n${c.schedule?.faculty?.name || ''}\nជំនាន់ ${c.schedule?.generation} (ឆ្នាំ ${c.schedule?.year})\nបន្ទប់: ${c.schedule?.classroom?.name || 'TBA'}`
              )
              .join('\n\n')
          } else {
            cell.value = '---'
          }
          cell.font = { name: 'Khmer OS Battambang', size: 10 }
          cell.alignment = {
            wrapText: true,
            horizontal: 'center',
            vertical: 'middle',
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
        currentRowIndex++
      })

      const footerRowIndex = currentRowIndex + 2
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
      sign3Cell.value =
        'ក្រុងសៀមរាប ថ្ងៃទី........ ខែ........... ឆ្នាំ............\nរៀបចំដោយ\nប្រធាន ក.ស.រ'
      sign3Cell.font = { name: 'Khmer OS Muol Light', size: 10 }
      sign3Cell.alignment = { horizontal: 'center', wrapText: true }

      const buffer = await workbook.xlsx.writeBuffer()
      const finalFileName = `កាលវិភាគបង្រៀន_${teacher?.name || ''}_${new Date().getTime()}.xlsx`
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
      size="2"
      onClick={handleExportExcel}
      style={{ cursor: 'pointer' }}
    >
      <FaFileExcel />
      <span className="hidden md:inline">Export Excel</span>
    </Button>
  )
}

export default ExportTeacherExcel

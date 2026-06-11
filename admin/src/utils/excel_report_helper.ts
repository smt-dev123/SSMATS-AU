import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import getBase64FromUrl from './image_base64'
import Logo from '@/assets/au.png'

export interface ColumnDefinition {
  header: string
  width: number
  key?: string
  transform?: (value: any, index: number) => any
}

export interface AdditionalInfo {
  label: string
  value: string
}

interface GenerateExcelOptions {
  title: string
  data: any[]
  columns: ColumnDefinition[]
  fileName: string
  sheetName?: string
  additionalInfo?: AdditionalInfo[]
}

export const generateExcelReport = async ({
  title,
  data,
  columns,
  fileName,
  sheetName = 'Report',
  additionalInfo = [],
}: GenerateExcelOptions) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    // Set Column Widths
    worksheet.columns = columns.map((col) => ({ width: col.width }))

    // Add LOGO
    try {
      const base64 = await getBase64FromUrl(Logo)
      const imageId = workbook.addImage({
        base64: base64,
        extension: 'png',
      })
      worksheet.addImage(imageId, {
        tl: { col: 1.9, row: 1.2 },
        ext: { width: 70, height: 70 },
      })
    } catch (e) {
      console.error('Logo Error:', e)
    }

    // Header Center - Country Info
    worksheet.mergeCells(`A1:${String.fromCharCode(64 + columns.length)}1`)
    const countryCell = worksheet.getCell('A1')
    countryCell.value = 'ព្រះរាជាណាចក្រកម្ពុជា'
    countryCell.font = { name: 'Khmer OS Muol Light', size: 11 }
    countryCell.alignment = { horizontal: 'center' }

    worksheet.mergeCells(`A2:${String.fromCharCode(64 + columns.length)}2`)
    const mottoCell = worksheet.getCell('A2')
    mottoCell.value = 'ជាតិ សាសនា ព្រះមហាក្សត្រ'
    mottoCell.font = { name: 'Khmer OS Muol Light', size: 10 }
    mottoCell.alignment = { horizontal: 'center' }

    worksheet.mergeCells(`A3:${String.fromCharCode(64 + columns.length)}3`)
    const symbolCell = worksheet.getCell('A3')
    symbolCell.value = '3'
    symbolCell.font = { name: 'Tacteing', size: 24 }
    symbolCell.alignment = { horizontal: 'center' }

    // University Info (under Logo)
    worksheet.mergeCells('A5:B5')
    const uniCell = worksheet.getCell('A5')
    uniCell.value = 'សាកលវិទ្យាល័យអង្គរ'
    uniCell.font = { name: 'Khmer OS Muol Light', size: 10 }
    uniCell.alignment = { horizontal: 'center' }

    worksheet.mergeCells('A6:B6')
    const refCell = worksheet.getCell('A6')
    refCell.value = 'លេខ:.......................ស.អ.'
    refCell.font = { name: 'Khmer OS Battambang', size: 11 }
    refCell.alignment = { horizontal: 'center' }

    // Report Title
    worksheet.mergeCells(`A7:${String.fromCharCode(64 + columns.length)}7`)
    const titleCell = worksheet.getCell('A7')
    titleCell.value = title
    titleCell.font = { name: 'Khmer OS Muol Light', size: 11 }
    titleCell.alignment = { horizontal: 'center' }

    // Additional Info (Major, Year, etc.)
    let currentRow = 8
    additionalInfo.forEach((info) => {
      worksheet.mergeCells(
        `A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`,
      )
      const infoCell = worksheet.getCell(`A${currentRow}`)
      infoCell.value = `${info.label}: ${info.value}`
      infoCell.font = { name: 'Khmer OS Muol Light', size: 11 }
      infoCell.alignment = { horizontal: 'center', indent: 1 }
      currentRow++
    })

    // Table Header
    const headerRowIndex = currentRow + 2
    const headerRow = worksheet.getRow(headerRowIndex)
    headerRow.values = columns.map((col) => col.header)

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }
      cell.font = { name: 'Khmer OS Battambang', bold: true, size: 10 }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    // Table Body
    data.forEach((item, index) => {
      const rowData = columns.map((col) => {
        if (col.transform) {
          return col.transform(item, index)
        }
        if (col.key) {
          // Handle nested keys like 'faculty.name'
          return col.key.split('.').reduce((obj, key) => obj?.[key], item)
        }
        return ''
      })

      const row = worksheet.addRow(rowData)

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Khmer OS Battambang', size: 10 }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        // Default alignment
        const colDef = columns[colNumber - 1]
        if (colDef.header === 'ល.រ' || colDef.header === 'ភេទ') {
          cell.alignment = { horizontal: 'center' }
        } else {
          cell.alignment = { horizontal: 'left', indent: 1 }
        }
      })
    })

    // Footer
    const footerRowIndex = worksheet.lastRow!.number + 2
    const lastColLetter = String.fromCharCode(64 + columns.length)
    const secondLastColLetter = String.fromCharCode(64 + columns.length - 1)

    worksheet.mergeCells(
      `${secondLastColLetter}${footerRowIndex}:${lastColLetter}${footerRowIndex}`,
    )
    const dateCell = worksheet.getCell(`${secondLastColLetter}${footerRowIndex}`)
    dateCell.value = `ក្រុងសៀមរាប ថ្ងៃទី........ ខែ........... ឆ្នាំ............`
    dateCell.font = { name: 'Khmer OS Battambang', size: 10 }
    dateCell.alignment = { horizontal: 'center' }

    worksheet.mergeCells(
      `${secondLastColLetter}${footerRowIndex + 1}:${lastColLetter}${footerRowIndex + 1}`,
    )
    const signCell = worksheet.getCell(
      `${secondLastColLetter}${footerRowIndex + 1}`,
    )
    signCell.value = 'ប្រធាន ក.ស.រ'
    signCell.font = { name: 'Khmer OS Muol Light', size: 11 }
    signCell.alignment = { horizontal: 'center' }

    // Download
    const buffer = await workbook.xlsx.writeBuffer()
    const finalFileName = `${fileName}_${new Date().getTime()}.xlsx`
    saveAs(new Blob([buffer]), finalFileName)
  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('មានបញ្ហាក្នុងការ Export Excel')
  }
}

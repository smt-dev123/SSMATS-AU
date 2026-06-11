import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import KhmerOS_siemreap from '../fonts/KhmerOS_siemreap.ttf'

// Register Khmer font
Font.register({
  family: 'KhmerOS_siemreap',
  src: KhmerOS_siemreap,
})

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'KhmerOS_siemreap', fontSize: 12 },
  table: {
    display: 'flex',
    borderCollapse: 'collapse',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: { flexDirection: 'row' },
  tableColHeader: {
    width: '16%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  tableCol: {
    width: '16%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 4,
  },
})

interface NameItem {
  id: string
  name: string
  gender: string
  marital_status: string
  education_level: string
  email: string
  phone: string
}

interface Props {
  data: NameItem[]
}

const NameListPDF: React.FC<Props> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>ID</Text>
          <Text style={styles.tableColHeader}>Name</Text>
          <Text style={styles.tableColHeader}>Gender</Text>
          <Text style={styles.tableColHeader}>Marital Status</Text>
          <Text style={styles.tableColHeader}>Education</Text>
          <Text style={styles.tableColHeader}>Email</Text>
          <Text style={styles.tableColHeader}>Phone</Text>
        </View>
        {data.map((item) => (
          <View style={styles.tableRow} key={item.id}>
            <Text style={styles.tableCol}>{item.id}</Text>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.gender}</Text>
            <Text style={styles.tableCol}>{item.marital_status}</Text>
            <Text style={styles.tableCol}>{item.education_level}</Text>
            <Text style={styles.tableCol}>{item.email}</Text>
            <Text style={styles.tableCol}>{item.phone}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

export default NameListPDF

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

Font.register({
  family: 'Battambang',
  src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/battambang/Battambang-Regular.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Battambang',
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 10,
  },
  infoSection: {
    marginBottom: 20,
    color: '#334155',
  },
  // Table Styles
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    padding: 5,
    textAlign: 'center',
  },
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    padding: 5,
    textAlign: 'center',
  },
  // Column Widths
  colNo: { width: '8%' },
  colName: { width: '30%', textAlign: 'left' },
  colGender: { width: '10%' },
  colPhone: { width: '22%' },
  colAbsent: { width: '10%' },
  colScore: { width: '20%', backgroundColor: '#eff6ff' },

  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    textAlign: 'center',
    width: 200,
  },
})

const AttendancePDF = ({ students }: { students: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text>ព្រះរាជាណាចក្រកម្ពុជា</Text>
        <Text>ជាតិ សាសនា ព្រះមហាក្សត្រ</Text>
        <Text style={styles.title}>របាយការណ៍វត្តមាន និងពិន្ទុប្រចាំឆមាស</Text>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text>ឆ្នាំទី ៤ ឆមាស ១ | ជំនាញ៖ វិទ្យាសាស្រ្ដកុំព្យូទ័រ</Text>
        <Text>មុខវិជ្ជា៖ Web Development | គ្រូបង្រៀន៖ ល. សេង ស៊ង់</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableColHeader, styles.colNo]}>ល.រ</Text>
          <Text style={[styles.tableColHeader, styles.colName]}>
            ឈ្មោះនិស្សិត
          </Text>
          <Text style={[styles.tableColHeader, styles.colGender]}>ភេទ</Text>
          <Text style={[styles.tableColHeader, styles.colPhone]}>
            លេខទូរស័ព្ទ
          </Text>
          <Text style={[styles.tableColHeader, styles.colAbsent]}>
            អវត្តមាន
          </Text>
          <Text style={[styles.tableColHeader, styles.colScore]}>ពិន្ទុ</Text>
        </View>

        {/* Table Body */}
        {students.map((s, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.tableCol, styles.colNo]}>{i + 1}</Text>
            <Text style={[styles.tableCol, styles.colName]}>{s.name}</Text>
            <Text style={[styles.tableCol, styles.colGender]}>{s.gender}</Text>
            <Text style={[styles.tableCol, styles.colPhone]}>{s.phone}</Text>
            <Text style={[styles.tableCol, styles.colAbsent]}>
              {s.leave + s.absent}
            </Text>
            <Text style={[styles.tableCol, styles.colScore]}>{s.score}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.signatureBox}>
          <Text>បានឃើញ និងពិនិត្យត្រឹមត្រូវ</Text>
          <Text style={{ marginTop: 5 }}>ការិយាល័យសិក្សា</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>ថ្ងៃទី........ ខែ........ ឆ្នាំ ២០២...</Text>
          <Text style={{ marginTop: 5 }}>សាស្ត្រាចារ្យទទួលបន្ទុក</Text>
          <Text style={{ marginTop: 40, fontWeight: 'bold' }}>ល. សេង ស៊ង់</Text>
        </View>
      </View>
    </Page>
  </Document>
)

export default AttendancePDF

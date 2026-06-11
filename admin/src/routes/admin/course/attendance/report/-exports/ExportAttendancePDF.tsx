import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'
import KhmerOSsiemreap from '@/fonts/KhmerOSsiemreap.ttf'
import KhmerOSMoulLight from '@/fonts/KhmerOSMoulLight.ttf'
import Logo from '@/assets/au.png'

Font.register({
  family: 'KhmerOSsiemreap',
  src: KhmerOSsiemreap,
})

Font.register({
  family: 'KhmerOSMoulLight',
  src: KhmerOSMoulLight,
})

const styles = StyleSheet.create({
  page: {
    padding: '1cm',
    fontFamily: 'KhmerOSsiemreap',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000',
  },
  headerCenter: {
    textAlign: 'center',
    marginBottom: 5,
  },
  countryName: {
    marginBottom: 2,
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 10,
  },
  motto: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 10,
  },
  navLeft: {
    position: 'absolute',
    top: 40,
    left: 40,
    alignItems: 'center',
    width: 120,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  universityName: {
    fontFamily: 'KhmerOSMoulLight',
    textAlign: 'center',
    fontSize: 9,
  },
  refNumber: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 9,
  },
  reportTitleSection: {
    textAlign: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 10,
    textDecoration: 'underline',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 10,
    marginBottom: 2,
  },
  boldText: {
    fontFamily: 'KhmerOSMoulLight',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    minHeight: 25,
  },
  tableHeaderText: {
    textAlign: 'center',
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 9,
  },
  cell: {
    padding: 4,
    borderRightColor: '#000',
    borderRightWidth: 1,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  lastCell: {
    borderRightWidth: 0,
  },
  colNo: { width: '6%', textAlign: 'center' },
  colName: { width: '25%', textAlign: 'left' },
  colGender: { width: '8%', textAlign: 'center' },
  colPhone: { width: '16%', textAlign: 'center' },
  colStatus: { width: '12%', textAlign: 'center' },
  colLeave: { width: '7%', textAlign: 'center' },
  colAbsent: { width: '7%', textAlign: 'center' },
  colTotal: { width: '7%', textAlign: 'center' },
  colPercent: { width: '8%', textAlign: 'center' },
  colScore: { width: '10%', textAlign: 'center' },
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  signatureBox: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  signatureTitle: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 10,
    marginBottom: 4,
  },
  signatureRole: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 10,
    marginBottom: 60,
  },
  dateText: {
    fontSize: 10,
    marginBottom: 4,
  },
})

export const AttendanceReportDocument = ({ course, students }: { course: any, students: any[] }) => {
  return (
    <Document title={`វត្តមាន_${course?.name || ''}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCenter}>
          <Text style={styles.countryName}>ព្រះរាជាណាចក្រកម្ពុជា</Text>
          <Text style={styles.motto}>ជាតិ សាសនា ព្រះមហាក្សត្រ</Text>
        </View>

        <View style={styles.navLeft}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.universityName}>សាកលវិទ្យាល័យអង្គរ</Text>
          <Text style={styles.refNumber}>លេខ:.......................ស.អ.</Text>
        </View>

        <View style={styles.reportTitleSection}>
          <Text style={styles.mainTitle}>
            របាយការណ៍វត្តមាន និងពិន្ទុប្រចាំឆមាស
          </Text>
          <Text style={styles.subTitle}>
            ឆ្នាំទី {course?.schedule?.year || '--'} ឆមាសទី {course?.schedule?.semester || '--'} | ជំនាញ៖ {course?.schedule?.department?.name || '--'}
          </Text>
          <Text style={styles.subTitle}>
            មុខវិជ្ជា៖ <Text style={styles.boldText}>{course?.name || '--'}</Text>
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.cell, styles.colNo]}><Text style={styles.tableHeaderText}>ល.រ </Text></View>
            <View style={[styles.cell, styles.colName]}><Text style={styles.tableHeaderText}>ឈ្មោះនិស្សិត </Text></View>
            <View style={[styles.cell, styles.colGender]}><Text style={styles.tableHeaderText}>ភេទ </Text></View>
            <View style={[styles.cell, styles.colPhone]}><Text style={styles.tableHeaderText}>លេខទូរស័ព្ទ </Text></View>
            <View style={[styles.cell, styles.colLeave]}><Text style={styles.tableHeaderText}>ច្បាប់ </Text></View>
            <View style={[styles.cell, styles.colAbsent]}><Text style={styles.tableHeaderText}>អវត្តមាន </Text></View>
            <View style={[styles.cell, styles.colTotal]}><Text style={styles.tableHeaderText}>សរុប </Text></View>
            <View style={[styles.cell, styles.colPercent]}><Text style={styles.tableHeaderText}>ភាគរយ </Text></View>
            <View style={[styles.cell, styles.colScore, styles.lastCell]}><Text style={styles.tableHeaderText}>ពិន្ទុវត្តមាន </Text></View>
          </View>

          {students.length > 0 ? (
            students.map((student: any, index: number) => {
              const totalAbsent = Number(student.leave || 0) + Number(student.absent || 0)
              const attendanceRate = `${Math.max(0, 100 - totalAbsent * 5)}%`

              return (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index === students.length - 1 ? { borderBottomWidth: 0 } : {},
                  ]}
                >
                  <View style={[styles.cell, styles.colNo]}><Text style={{ textAlign: 'center' }}>{index + 1}</Text></View>
                  <View style={[styles.cell, styles.colName]}><Text style={{ textTransform: 'uppercase' }}>{student.name}</Text></View>
                  <View style={[styles.cell, styles.colGender]}><Text style={{ textAlign: 'center' }}>{student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender}</Text></View>
                  <View style={[styles.cell, styles.colPhone]}><Text style={{ textAlign: 'center' }}>{student.phone}</Text></View>
                  <View style={[styles.cell, styles.colLeave]}><Text style={{ textAlign: 'center' }}>{student.leave}</Text></View>
                  <View style={[styles.cell, styles.colAbsent]}><Text style={{ textAlign: 'center' }}>{student.absent}</Text></View>
                  <View style={[styles.cell, styles.colTotal]}><Text style={{ textAlign: 'center', fontFamily: 'KhmerOSMoulLight' }}>{totalAbsent}</Text></View>
                  <View style={[styles.cell, styles.colPercent]}><Text style={{ textAlign: 'center' }}>{attendanceRate}</Text></View>
                  <View style={[styles.cell, styles.colScore, styles.lastCell]}><Text style={{ textAlign: 'center', fontFamily: 'KhmerOSMoulLight' }}>{student.score}</Text></View>
                </View>
              )
            })
          ) : (
            <View style={{ padding: 20, textAlign: 'center' }}>
              <Text>មិនមានទិន្នន័យ</Text>
            </View>
          )}
        </View>

        {/* Footer Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>បានឃើញ និងឯកភាព</Text>
            <Text style={styles.signatureRole}>ព្រឹទ្ធបុរស</Text>
            <Text style={styles.signatureTitle}>....................................</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.dateText}>{`ថ្ងៃទី........ ខែ........... ឆ្នាំ............`}</Text>
            <Text style={styles.signatureTitle}>សាស្ត្រាចារ្យមុខវិជ្ជា</Text>
            <Text style={styles.signatureRole}> </Text>
            <Text style={styles.signatureTitle}>....................................</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

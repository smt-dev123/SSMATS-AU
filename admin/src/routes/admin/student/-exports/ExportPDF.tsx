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
import type { StudentsType } from '@/types'

// Register Font
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
    fontSize: 11, // បន្ថយមក ១១ ដើម្បីឱ្យមើលទៅសមសួនជាមួយតារាង
    lineHeight: 1.5,
    color: '#000',
  },
  headerCenter: {
    textAlign: 'center',
    marginBottom: 5,
  },
  countryName: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'KhmerOSMoulLight',
  },
  motto: {
    fontSize: 10,
    marginBottom: 5,
    fontFamily: 'KhmerOSMoulLight',
  },
  navLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: -25,
    marginBottom: 10,
  },
  logo: {
    width: 55,
    height: 55,
    marginBottom: 5,
  },
  universityName: {
    fontSize: 11,
    fontFamily: 'KhmerOSMoulLight',
    textAlign: 'center',
  },
  refNumber: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  reportTitleSection: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  // តារាងដែលបានកែសម្រួល
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0, // លុបចេញដើម្បីកុំឱ្យជាន់បន្ទាត់ cell ចុងក្រោយ
    borderBottomWidth: 0, // លុបចេញដើម្បីកុំឱ្យជាន់បន្ទាត់ row ចុងក្រោយ
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    minHeight: 28,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontFamily: 'KhmerOSMoulLight',
  },
  tableHeaderText: {
    textAlign: 'center',
    fontSize: 10,
  },
  cell: {
    padding: 4,
    borderRightColor: '#000',
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  // កំណត់ទំហំជួរឈរ (Columns Width)
  colNo: { width: '8%' },
  colName: { width: '42%' },
  colGender: { width: '15%' },
  colPhone: { width: '35%' },

  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    alignItems: 'center',
    width: 'auto',
  },
})

const StudentReport = ({ data }: { data: StudentsType[] }) => (
  <Document title="បញ្ជីរាយនាមនិស្សិត">
    <Page size="A4" style={styles.page}>
      <View style={styles.headerCenter}>
        <Text style={styles.countryName}>ព្រះរាជាណាចក្រកម្ពុជា</Text>
        <Text style={styles.motto}>ជាតិ សាសនា ព្រះមហាក្សត្រ</Text>
      </View>

      <View style={styles.navLeft}>
        <View style={{ alignItems: 'center' }}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.universityName}>សាកលវិទ្យាល័យអង្គរ</Text>
          <Text style={styles.refNumber}>លេខ:.......................ស.អ.</Text>
        </View>
      </View>

      <View style={styles.reportTitleSection}>
        <Text style={[styles.countryName, { textDecoration: 'underline' }]}>
          បញ្ជីរាយនាមនិស្សិត
        </Text>
      </View>

      {/* តារាងថ្មី */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.cell, styles.colNo]}>
            <Text style={styles.tableHeaderText}>ល.រ</Text>
          </View>
          <View style={[styles.cell, styles.colName]}>
            <Text style={styles.tableHeaderText}>ឈ្មោះភាសាខ្មែរ </Text>
          </View>
          <View style={[styles.cell, styles.colName]}>
            <Text style={styles.tableHeaderText}>ឈ្មោះភាសាអង់គ្លេស </Text>
          </View>
          <View style={[styles.cell, styles.colGender]}>
            <Text style={styles.tableHeaderText}>ភេទ </Text>
          </View>
          <View style={[styles.cell, styles.colPhone]}>
            <Text style={styles.tableHeaderText}>លេខទូរស័ព្ទ </Text>
          </View>
          <View style={[styles.cell, styles.colName]}>
            <Text style={styles.tableHeaderText}>អាស័យដ្ឋាន </Text>
          </View>
        </View>

        {/* Table Body */}
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.cell, styles.colNo]}>
                <Text style={{ textAlign: 'center' }}>{index + 1}</Text>
              </View>
              <View style={[styles.cell, styles.colName]}>
                <Text style={{ paddingLeft: 5 }}>{item.name + ' '}</Text>
              </View>
              <View style={[styles.cell, styles.colName]}>
                <Text style={{ paddingLeft: 5 }}>{item.nameEn + ' '}</Text>
              </View>
              <View style={[styles.cell, styles.colGender]}>
                <Text style={{ textAlign: 'center' }}>{item.gender || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colPhone]}>
                <Text style={{ textAlign: 'center' }}>{item.phone + ' ' || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colName]}>
                <Text style={{ paddingLeft: 5 }}>{item.address + ' ' || ''}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.tableRow, { justifyContent: 'center' }]}>
            <Text style={{ marginTop: 10 }}>មិនមានទិន្នន័យ</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.signatureBox}></View>
        <View style={styles.signatureBox}>
          <Text>{`ថ្ងៃ.................... ខែ........ឆ្នាំ.......................ព.ស............`}</Text>
          <Text style={{ marginTop: 5 }}>
            {`ក្រុងសៀមរាប ថ្ងៃទី........ ខែ........... ឆ្នាំ............`}
          </Text>
          <Text style={{ marginTop: 5, fontFamily: 'KhmerOSMoulLight' }}>
            ប្រធាន ក.ស.រ
          </Text>
          <Text style={{ marginTop: 60 }}>
            ....................................
          </Text>
        </View>
      </View>
    </Page>
  </Document>
)

export default StudentReport

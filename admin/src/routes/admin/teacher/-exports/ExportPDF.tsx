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
import type { TeachersType } from '@/types'

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
    fontSize: 10, // Reduced font size to fit more columns
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
    fontSize: 12,
  },
  motto: {
    marginBottom: 5,
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 11,
  },
  navLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: -20,
    marginBottom: 5,
  },
  logoContainer: {
    marginBottom: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  universityName: {
    fontFamily: 'KhmerOSMoulLight',
    textAlign: 'left',
    fontSize: 11,
  },
  refNumber: {
    marginTop: 2,
    textAlign: 'left',
    fontSize: 10,
  },
  reportTitleSection: {
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
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
  },
  tableHeaderText: {
    textAlign: 'center',
    fontWeight: 600,
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
  colName: { width: '22%', textAlign: 'left' },
  colGender: { width: '8%', textAlign: 'center' },
  colFaculty: { width: '22%', textAlign: 'left' },
  colPhone: { width: '18%', textAlign: 'left' },
  colAddress: { width: '24%', textAlign: 'left' },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
  },
  signatureSpace: {
    marginTop: 5,
  },
})

export const TeacherReport = ({ data }: { data: TeachersType[] }) => (
  <Document title="បញ្ជីសាស្រ្ដាចារ្យ">
    <Page size="A4" style={styles.page}>
      {/* ក្បាលលិខិតជាតិ */}
      <View style={styles.headerCenter}>
        <Text style={styles.countryName}>ព្រះរាជាណាចក្រកម្ពុជា</Text>
        <Text style={styles.motto}>ជាតិ សាសនា ព្រះមហាក្សត្រ</Text>
      </View>

      {/* ផ្នែក Logo និងឈ្មោះសាកលវិទ្យាល័យ */}
      <View style={styles.navLeft}>
        <View style={styles.signatureBox}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.universityName}>សាកលវិទ្យាល័យអង្គរ</Text>
          <Text style={styles.refNumber}>លេខ:.......................ស.អ.</Text>
        </View>
      </View>

      {/* ចំណងជើងបញ្ជី */}
      <View style={styles.reportTitleSection}>
        <Text style={[styles.countryName, { textDecoration: 'underline' }]}>
          បញ្ជីរាយនាមសាស្រ្ដាចារ្យ
        </Text>
        <Text style={styles.motto}>ឆ្នាំសិក្សា ២០២៥-២០២៦</Text>
      </View>

      {/* តារាង */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.cell, styles.colNo]}>
            <Text style={styles.tableHeaderText}>ល.រ</Text>
          </View>
          <View style={[styles.cell, styles.colName]}>
            <Text style={styles.tableHeaderText}>គោត្តនាម-នាម</Text>
          </View>
          <View style={[styles.cell, styles.colGender]}>
            <Text style={styles.tableHeaderText}>ភេទ</Text>
          </View>
          <View style={[styles.cell, styles.colFaculty]}>
            <Text style={styles.tableHeaderText}>មហាវិទ្យាល័យ</Text>
          </View>
          <View style={[styles.cell, styles.colPhone]}>
            <Text style={styles.tableHeaderText}>លេខទូរស័ព្ទ</Text>
          </View>
          <View style={[styles.cell, styles.colAddress, styles.lastCell]}>
            <Text style={styles.tableHeaderText}>អាស័យដ្ឋាន</Text>
          </View>
        </View>

        {data && data.length > 0 ? (
          data.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index === data.length - 1 ? { borderBottomWidth: 0 } : {},
              ]}
            >
              <View style={[styles.cell, styles.colNo]}>
                <Text style={{ textAlign: 'center' }}>{index + 1}</Text>
              </View>
              <View style={[styles.cell, styles.colName]}>
                <Text>{item.name}</Text>
              </View>
              <View style={[styles.cell, styles.colGender]}>
                <Text style={{ textAlign: 'center' }}>
                  {item.gender === 'male' ? 'ប' : item.gender === 'female' ? 'ស' : item.gender || ''}
                </Text>
              </View>
              <View style={[styles.cell, styles.colFaculty]}>
                <Text>{item.faculty?.name || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colPhone]}>
                <Text>{item.phone || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colAddress, styles.lastCell]}>
                <Text>{item.address || ''}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 20, textAlign: 'center' }}>
            <Text>មិនមានទិន្នន័យ</Text>
          </View>
        )}
      </View>

      {/* ហត្ថលេខា */}
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
          <View style={styles.signatureSpace} />
          <Text style={{ marginTop: 60 }}>
            ....................................
          </Text>
        </View>
      </View>
    </Page>
  </Document>
)

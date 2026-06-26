import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { ScheduleType } from '@/types'
import KhmerOSsiemreap from '@/fonts/KhmerOSsiemreap.ttf'
import KhmerOSMoulLight from '@/fonts/KhmerOSMoulLight.ttf'
import Logo from '@/assets/au.png'

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
    fontSize: 9, // Reduced font size to fit more columns
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
  colNo: { width: '5%', textAlign: 'center' },
  colFaculty: { width: '20%', textAlign: 'left' },
  colDepartment: { width: '20%', textAlign: 'left' },
  colLevel: { width: '10%', textAlign: 'center' },
  colGen: { width: '7%', textAlign: 'center' },
  colYear: { width: '7%', textAlign: 'center' },
  colSem: { width: '7%', textAlign: 'center' },
  colShift: { width: '7%', textAlign: 'center' },
  colRoom: { width: '17%', textAlign: 'left' },
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

export const ScheduleReport = ({ data }: { data: Array<ScheduleType> }) => (
  <Document title="បញ្ជីកាលវិភាគសិក្សា">
    <Page size="A4" orientation="landscape" style={styles.page}>
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
          បញ្ជីកាលវិភាគសិក្សា
        </Text>
        <Text style={styles.motto}>ឆ្នាំសិក្សា ២០២៥-២០២៦</Text>
      </View>

      {/* តារាង */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.cell, styles.colNo]}>
            <Text style={styles.tableHeaderText}>ល.រ</Text>
          </View>
          <View style={[styles.cell, styles.colFaculty]}>
            <Text style={styles.tableHeaderText}>មហាវិទ្យាល័យ</Text>
          </View>
          <View style={[styles.cell, styles.colDepartment]}>
            <Text style={styles.tableHeaderText}>ដេប៉ាតឺម៉ង់</Text>
          </View>
          <View style={[styles.cell, styles.colLevel]}>
            <Text style={styles.tableHeaderText}>កម្រិត</Text>
          </View>
          <View style={[styles.cell, styles.colGen]}>
            <Text style={styles.tableHeaderText}>ជំនាន់ទី</Text>
          </View>
          <View style={[styles.cell, styles.colYear]}>
            <Text style={styles.tableHeaderText}>ឆ្នាំទី</Text>
          </View>
          <View style={[styles.cell, styles.colSem]}>
            <Text style={styles.tableHeaderText}>ឆមាសទី</Text>
          </View>
          <View style={[styles.cell, styles.colShift]}>
            <Text style={styles.tableHeaderText}>វេន</Text>
          </View>
          <View style={[styles.cell, styles.colRoom, styles.lastCell]}>
            <Text style={styles.tableHeaderText}>បន្ទប់</Text>
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
              <View style={[styles.cell, styles.colFaculty]}>
                <Text>{item.faculty?.name || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colDepartment]}>
                <Text>{item.department?.name || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colLevel]}>
                <Text style={{ textAlign: 'center' }}>
                  {item.academicLevel?.level || ''}
                </Text>
              </View>
              <View style={[styles.cell, styles.colGen]}>
                <Text style={{ textAlign: 'center' }}>
                  {item.generation || ''}
                </Text>
              </View>
              <View style={[styles.cell, styles.colYear]}>
                <Text style={{ textAlign: 'center' }}>{item.year || ''}</Text>
              </View>
              <View style={[styles.cell, styles.colSem]}>
                <Text style={{ textAlign: 'center' }}>
                  {item.semester || ''}
                </Text>
              </View>
              <View style={[styles.cell, styles.colShift]}>
                <Text style={{ textAlign: 'center' }}>
                  {item.sessionTime?.shift === 'morning'
                    ? 'ព្រឹក'
                    : item.sessionTime?.shift === 'evening'
                      ? 'ល្ងាច'
                      : item.sessionTime?.shift === 'night'
                        ? 'យប់'
                        : ''}
                </Text>
              </View>
              <View style={[styles.cell, styles.colRoom, styles.lastCell]}>
                <Text>{item.classroom?.name || ''}</Text>
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

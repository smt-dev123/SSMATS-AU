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
    fontSize: 12,
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
  },
  motto: {
    marginBottom: 5,
    fontFamily: 'KhmerOSMoulLight',
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
  },
  refNumber: {
    marginTop: 2,
    textAlign: 'left',
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
    minHeight: 30,
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
    padding: 6,
    borderRightColor: '#000',
    borderRightWidth: 1,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  lastCell: {
    borderRightWidth: 0,
  },
  colNo: { width: '10%', textAlign: 'center' },
  colName: { width: '35%', textAlign: 'left' },
  colDesc: { width: '55%', textAlign: 'left' },
  footer: {
    marginTop: 5,
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

export const BuildingReport = ({ data }: { data: any[] }) => (
  <Document title="បញ្ជីអាគារសិក្សា">
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
          បញ្ជីអាគារសិក្សា
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
            <Text style={styles.tableHeaderText}>អាគារសិក្សា</Text>
          </View>
          <View style={[styles.cell, styles.colDesc, styles.lastCell]}>
            <Text style={styles.tableHeaderText}>ផ្សេងៗ</Text>
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
              <View style={[styles.cell, styles.colDesc, styles.lastCell]}>
                <Text>{item.description || ''}</Text>
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

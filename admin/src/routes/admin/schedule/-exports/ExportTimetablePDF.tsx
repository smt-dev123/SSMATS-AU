import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
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
    marginBottom: 20,
  },
  countryName: {
    marginBottom: 2,
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 12,
  },
  motto: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 11,
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
    marginBottom: 15,
  },
  mainTitle: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 12,
    marginBottom: 6,
  },
  subTitle: {
    fontFamily: 'KhmerOSMoulLight',
    fontSize: 11,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 10,
    marginBottom: 4,
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
    minHeight: 45,
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
  colSession: { width: '16%', textAlign: 'center' },
  colDay: { width: '12%', textAlign: 'center' },
  courseText: {
    textAlign: 'center',
    fontSize: 8,
    marginBottom: 3,
  },
  teacherText: {
    textAlign: 'center',
    fontSize: 8,
    marginBottom: 1,
  },
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

const toKhmerNum = (num: number | string | undefined | null) => {
  if (num === undefined || num === null) return ''
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
  return num
    .toString()
    .split('')
    .map((d) => (/[0-9]/.test(d) ? khmerNumbers[parseInt(d)] : d))
    .join('')
}

const getKhmerDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const khmerMonths = [
    'មករា',
    'កុម្ភៈ',
    'មីនា',
    'មេសា',
    'ឧសភា',
    'មិថុនា',
    'កក្កដា',
    'សីហា',
    'កញ្ញា',
    'តុលា',
    'វិច្ឆិកា',
    'ធ្នូ',
  ]
  return `ថ្ងៃទី${toKhmerNum(date.getDate())} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${toKhmerNum(date.getFullYear())}`
}

export const TimetableReport = ({ schedule }: { schedule: any }) => {
  const courses = schedule?.courses || []

  const days = [
    { key: 'monday', label: 'ចន្ទ' },
    { key: 'tuesday', label: 'អង្គារ' },
    { key: 'wednesday', label: 'ពុធ' },
    { key: 'thursday', label: 'ព្រហស្បតិ៍' },
    { key: 'friday', label: 'សុក្រ' },
    { key: 'saturday', label: 'សៅរ៍' },
    { key: 'sunday', label: 'អាទិត្យ' },
  ]

  const shiftText =
    schedule?.sessionTime?.shift === 'morning'
      ? 'ព្រឹក'
      : schedule?.sessionTime?.shift === 'evening'
        ? 'ល្ងាច'
        : schedule?.sessionTime?.shift === 'night'
          ? 'យប់'
          : ''
  const academicLevelText = schedule?.academicLevel?.level || 'បរិញ្ញាបត្រ'

  return (
    <Document title={`កាលវិភាគ_${schedule?.id || ''}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
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
            កាលវិភាគសិក្សាថ្នាក់{academicLevelText}
          </Text>
          <Text style={styles.subTitle}>
            ជំនាន់ទី{toKhmerNum(schedule?.generation)} ឆ្នាំទី
            {toKhmerNum(schedule?.year)} ឆមាសទី{toKhmerNum(schedule?.semester)}{' '}
            ឆ្នាំសិក្សា{toKhmerNum(schedule?.academicYear?.name)}
          </Text>
          <Text style={[styles.subTitle, { fontSize: 11 }]}>
            មុខជំនាញ ៖ {schedule?.department?.name || ''}
          </Text>
          <Text style={styles.detailText}>
            ចាប់ផ្ដើមពី{getKhmerDate(schedule?.semesterStart)} បញ្ចប់ត្រឹម{' '}
            {getKhmerDate(schedule?.semesterEnd)}
          </Text>
          <Text style={styles.detailText}>
            វេនសិក្សា ៖ {shiftText} បន្ទប់ ៖ {schedule?.classroom?.name || ''}
          </Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.cell, styles.colSession]}>
              <Text style={styles.tableHeaderText}>Sessions/ម៉ោង </Text>
            </View>
            {days.map((day, i) => (
              <View
                key={day.key}
                style={[
                  styles.cell,
                  styles.colDay,
                  i === days.length - 1 ? styles.lastCell : {},
                ]}
              >
                <Text style={styles.tableHeaderText}>{day.label} </Text>
              </View>
            ))}
          </View>

          {/* Session 1 Row */}
          <View style={styles.tableRow}>
            <View style={[styles.cell, styles.colSession]}>
              <Text style={{ textAlign: 'center', fontSize: 9 }}>
                Session 1{' '}
              </Text>
              <Text style={{ textAlign: 'center', fontSize: 9, marginTop: 4 }}>
                {schedule?.sessionTime?.firstSessionStartTime}-
                {schedule?.sessionTime?.firstSessionEndTime}
              </Text>
            </View>
            {days.map((day, i) => {
              const course = courses.find(
                (c: any) => c.day.toLowerCase() === day.key,
              )
              return (
                <View
                  key={day.key}
                  style={[
                    styles.cell,
                    styles.colDay,
                    i === days.length - 1 ? styles.lastCell : {},
                  ]}
                >
                  {course ? (
                    <>
                      <Text style={styles.courseText}>{course.name} </Text>
                      <Text style={styles.teacherText}>
                        ល. {course.teacher?.name}{' '}
                      </Text>
                      <Text style={styles.teacherText}>
                        {course.teacher?.phone}{' '}
                      </Text>
                    </>
                  ) : null}
                </View>
              )
            })}
          </View>

          {/* Session 2 Row */}
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.cell, styles.colSession]}>
              <Text style={{ textAlign: 'center', fontSize: 9 }}>
                Session 2
              </Text>
              <Text style={{ textAlign: 'center', fontSize: 9, marginTop: 4 }}>
                {schedule?.sessionTime?.secondSessionStartTime}-
                {schedule?.sessionTime?.secondSessionEndTime}
              </Text>
            </View>
            {days.map((day, i) => {
              const course = courses.find(
                (c: any) => c.day.toLowerCase() === day.key,
              )
              return (
                <View
                  key={day.key}
                  style={[
                    styles.cell,
                    styles.colDay,
                    i === days.length - 1 ? styles.lastCell : {},
                  ]}
                >
                  {course ? (
                    <>
                      <Text style={styles.courseText}>{course.name} </Text>
                      <Text style={styles.teacherText}>
                        ល. {course.teacher?.name}{' '}
                      </Text>
                      <Text style={styles.teacherText}>
                        {course.teacher?.phone}{' '}
                      </Text>
                    </>
                  ) : null}
                </View>
              )
            })}
          </View>
        </View>

        {/* Footer Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>បានឃើញ និងឯកភាព </Text>
            <Text style={styles.signatureRole}>សាកលវិទ្យាធិការ </Text>
            <Text style={styles.signatureTitle}>
              ....................................
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>បានពិនិត្យ និងឯកភាព </Text>
            <Text style={styles.signatureRole}>សាកលវិទ្យាធិការរង </Text>
            <Text style={styles.signatureTitle}>
              ....................................
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <Text
              style={styles.dateText}
            >{`ក្រុងសៀមរាប ថ្ងៃទី........ ខែ........... ឆ្នាំ............`}</Text>
            <Text style={styles.signatureTitle}>រៀបចំដោយ </Text>
            <Text style={styles.signatureRole}>ប្រធាន ក.ស.រ </Text>
            <Text style={styles.signatureTitle}>
              ....................................
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

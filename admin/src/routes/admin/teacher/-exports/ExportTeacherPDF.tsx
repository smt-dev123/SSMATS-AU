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
import { DAYS_OF_WEEK } from '@/features/schedule/constants'

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

export const TeacherTimetableReport = ({
  teacher,
  courses,
}: {
  teacher: any
  courses: any[]
}) => {
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

  return (
    <Document title={`កាលវិភាគបង្រៀន_${teacher?.name || ''}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerCenter}>
          <Text style={styles.countryName}>ព្រះរាជាណាចក្រកម្ពុជា </Text>
          <Text style={styles.motto}>ជាតិ សាសនា ព្រះមហាក្សត្រ </Text>
        </View>

        <View style={styles.navLeft}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.universityName}>សាកលវិទ្យាល័យអង្គរ </Text>
          <Text style={styles.refNumber}>លេខ:.......................ស.អ. </Text>
        </View>

        <View style={styles.reportTitleSection}>
          <Text style={styles.mainTitle}>កាលវិភាគបង្រៀន </Text>
          <Text style={styles.subTitle}>
            ឈ្មោះគ្រូបង្រៀន៖ {teacher?.name || ''}
          </Text>
          <Text style={styles.detailText}>
            លេខទូរស័ព្ទ៖ {teacher?.phone || ''}
          </Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.cell, styles.colSession]}>
              <Text style={styles.tableHeaderText}>ម៉ោង/វេនសិក្សា </Text>
            </View>
            {DAYS_OF_WEEK.map((day, i) => (
              <View
                key={day.key}
                style={[
                  styles.cell,
                  styles.colDay,
                  i === DAYS_OF_WEEK.length - 1 ? styles.lastCell : {},
                ]}
              >
                <Text style={styles.tableHeaderText}>{day.label} </Text>
              </View>
            ))}
          </View>

          {uniqueSessionTimes.length === 0 && (
            <View
              style={[
                styles.tableRow,
                { borderBottomWidth: 0, justifyContent: 'center', height: 50 },
              ]}
            >
              <Text>មិនមានកាលវិភាគបង្រៀនទេ</Text>
            </View>
          )}

          {uniqueSessionTimes.map((session: any, index) => {
            const isLastRow = index === uniqueSessionTimes.length - 1
            const shiftStr =
              session.shift === 'morning'
                ? 'ព្រឹក'
                : session.shift === 'evening'
                  ? 'ល្ងាច'
                  : 'យប់'
            return (
              <View
                key={session.id}
                style={[
                  styles.tableRow,
                  isLastRow ? { borderBottomWidth: 0 } : {},
                ]}
              >
                <View style={[styles.cell, styles.colSession]}>
                  <Text style={{ textAlign: 'center', fontSize: 9 }}>
                    {shiftStr}
                  </Text>
                  <Text
                    style={{ textAlign: 'center', fontSize: 9, marginTop: 4 }}
                  >
                    {session.firstSessionStartTime}-
                    {session.firstSessionEndTime}
                  </Text>
                  <Text
                    style={{ textAlign: 'center', fontSize: 9, marginTop: 4 }}
                  >
                    {session.secondSessionStartTime}-
                    {session.secondSessionEndTime}
                  </Text>
                </View>
                {DAYS_OF_WEEK.map((day, i) => {
                  const dayCourses = courses.filter(
                    (c: any) =>
                      c.schedule?.sessionTimeId === session.id &&
                      c.day.toLowerCase() === day.key,
                  )
                  return (
                    <View
                      key={day.key}
                      style={[
                        styles.cell,
                        styles.colDay,
                        i === DAYS_OF_WEEK.length - 1 ? styles.lastCell : {},
                      ]}
                    >
                      {dayCourses.length === 0 ? (
                        <Text style={styles.teacherText}>---</Text>
                      ) : null}
                      {dayCourses.map((course: any, idx: number) => (
                        <View
                          key={idx}
                          style={{
                            marginBottom: idx < dayCourses.length - 1 ? 5 : 0,
                          }}
                        >
                          <Text style={styles.courseText}>{course.name} </Text>
                          <Text style={styles.teacherText}>
                            {course.schedule?.faculty?.name}{' '}
                          </Text>
                          <Text style={styles.teacherText}>
                            ជំ​នាន់ {course.schedule?.generation} (ឆ្នាំ{' '}
                            {course.schedule?.year}){' '}
                          </Text>
                          <Text style={styles.teacherText}>
                            បន្ទប់:{' '}
                            {course.schedule?.classroom?.name || 'TBA'}{' '}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )
                })}
              </View>
            )
          })}
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

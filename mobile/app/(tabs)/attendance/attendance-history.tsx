import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { getCourseAttendanceReport } from "@/api/AttendanceAPI";
import { useSession } from "@/lib/auth-client";

export default function AttendanceHistory() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const { t } = useTranslation();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const isStudent = (session?.user as any)?.role === "student";
  const studentRecord = isStudent ? students[0] : null;

  useEffect(() => {
    const fetchReport = async () => {
      if (!courseId) return;
      try {
        const data = await getCourseAttendanceReport(Number(courseId));
        const user = session?.user as any;

        // If the user is a student, only show their own attendance record
        if (user?.role === "student") {
          const myRecord = data.filter(
            (s: any) =>
              s.studentCode === user.studentCode || s.name === user.name,
          );
          setStudents(myRecord);
        } else {
          setStudents(data);
        }
      } catch (error) {
        console.error("Fetch report error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [courseId, session]);

  const searchQuery = (search || "").trim().toLowerCase();

  const filteredStudents = searchQuery
    ? students.filter((s) =>
        (s.name?.toLowerCase() || "").includes(searchQuery),
      )
    : students;

  const totalStudents = students.length;
  const totalAbsent = isStudent
    ? Number(studentRecord?.absent || 0)
    : students.reduce((acc, s) => acc + Number(s.absent || 0), 0);
  const totalLeave = isStudent
    ? Number(studentRecord?.leave || 0)
    : students.reduce((acc, s) => acc + Number(s.leave || 0), 0);

  const renderStudentReport = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const absent = Number(item.absent || 0);
    const leave = Number(item.leave || 0);
    const totalAbsentScore = leave + absent;
    const statusStr = String(item.status || "").toLowerCase();
    const attendanceRate =
      statusStr === "dropped out"
        ? "0%"
        : `${Math.max(0, 100 - totalAbsentScore * 5)}%`;

    return (
      <View style={styles.sessionCard}>
        <View style={styles.studentRow}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {index + 1}. {item.name}
            </Text>
            <Text style={styles.studentClass}>
              Gender:{" "}
              {item.gender === "male"
                ? "Male"
                : item.gender === "female"
                  ? "Female"
                  : item.gender}{" "}
              | Phone: {item.phone || "N/A"}
            </Text>
            <Text
              style={[
                styles.studentClass,
                {
                  color: statusStr === "enrolled" ? "#4CAF50" : "#E24B4A",
                  fontWeight: "600",
                  marginTop: 4,
                },
              ]}
            >
              Status: {item.status}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.miniStatsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Leave</Text>
            <Text style={[styles.miniStatValue, { color: "#FF9800" }]}>
              {leave}
            </Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Absent</Text>
            <Text style={[styles.miniStatValue, { color: "#E24B4A" }]}>
              {absent}
            </Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Total</Text>
            <Text style={[styles.miniStatValue, { fontWeight: "700" }]}>
              {totalAbsentScore}
            </Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Rate</Text>
            <Text style={[styles.miniStatValue, { color: "#4CAF50" }]}>
              {attendanceRate}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <ScreenHeader
          title={t("attendance.history", "Attendance Report")}
          showBack
          onBack={() => router.back()}
        />

        {/* Search */}
        {!isStudent && (
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={16}
              color="#aaa"
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t("attendance.searchNames", "Search names...")}
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}

        {/* Stats */}
        {isStudent && studentRecord ? (
          <View style={styles.sessionCard}>
            <Text style={styles.studentName}>
              Subject: {studentRecord.courseName}
            </Text>
            <Text style={styles.studentClass}>
              Student: {studentRecord.name}
            </Text>
            <View style={styles.statsDivider} />
            <View style={styles.miniStatsRow}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Total</Text>
                <Text style={[styles.miniStatValue, { fontWeight: "700" }]}>
                  {studentRecord.total ?? 0}
                </Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Present</Text>
                <Text style={[styles.miniStatValue, { color: "#4CAF50" }]}>
                  {studentRecord.present ?? 0}
                </Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Absent</Text>
                <Text style={[styles.miniStatValue, { color: "#E24B4A" }]}>
                  {studentRecord.absent ?? 0}
                </Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Late</Text>
                <Text style={[styles.miniStatValue, { color: "#FF9800" }]}>
                  {studentRecord.late ?? 0}
                </Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Rate</Text>
                <Text style={[styles.miniStatValue, { color: "#4CAF50" }]}>
                  {studentRecord.presentPct != null
                    ? `${studentRecord.presentPct}%`
                    : `${Math.round(
                        ((studentRecord.present ?? 0) /
                          Math.max(1, studentRecord.total ?? 1)) *
                          100,
                      )}%`}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Total Students</Text>
              <Text style={[styles.statsCount, { color: "#111" }]}>
                {totalStudents}
              </Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Total Leave</Text>
              <Text style={[styles.statsCount, { color: "#FF9800" }]}>
                {totalLeave}
              </Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Total Absent</Text>
              <Text style={[styles.statsCount, { color: "#E24B4A" }]}>
                {totalAbsent}
              </Text>
            </View>
          </View>
        )}

        {/* List */}
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.emptyText}>Loading report...</Text>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No attendance data found.</Text>
          </View>
        ) : isStudent ? null : filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No records found for {search}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentReport}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  listContent: { padding: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "#E5E5E5",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statsLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 6,
    textAlign: "center",
  },
  statsCount: { fontSize: 18, fontWeight: "700" },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  studentInfo: { flex: 1, paddingRight: 12 },
  studentName: { fontSize: 15, fontWeight: "700", color: "#111" },
  studentClass: { fontSize: 12, color: "#666", marginTop: 2 },
  scoreBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 60,
  },
  scoreLabel: {
    fontSize: 10,
    color: "#1976D2",
    fontWeight: "600",
    marginBottom: 2,
  },
  scoreText: { fontSize: 16, fontWeight: "bold", color: "#1976D2" },
  statsDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  miniStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  miniStat: {
    alignItems: "center",
    flex: 1,
  },
  miniStatLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyText: { color: "#666", fontSize: 15, textAlign: "center" },
});

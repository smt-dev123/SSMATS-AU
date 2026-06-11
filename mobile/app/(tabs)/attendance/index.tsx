import { getCourseAttendance, markBulkAttendance } from "@/api/AttendanceAPI";
import { getCourseById, getCourses, getCourseStudents } from "@/api/CourseAPI";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { checkAttendanceAccess } from "@/lib/attendance";
import { getLocalDateString } from "@/lib/date";
import { useSession } from "@/lib/auth-client";
import type { AttendanceStatusEnum } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStyles } from "@/styles/attendance.style";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function AttendanceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const stylesheet = getStyles(colorScheme);
  const { data: session } = useSession();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number>(1);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Access check
  const role = (session?.user as any)?.role || "";
  const isStudent = role === "student";
  const accessCheck = useMemo(
    () =>
      checkAttendanceAccess(
        selectedCourse,
        getLocalDateString(),
        role,
      ),
    [selectedCourse, role],
  );

  // Fetch courses on focus
  useFocusEffect(
    useCallback(() => {
      const fetchCourses = async () => {
        try {
          const res = await getCourses();
          if (res?.data) {
            let courseList = res.data;
            if (courseId) {
              let currentCourse = courseList.find(
                (course: any) => String(course.id) === String(courseId),
              );
              if (!currentCourse) {
                currentCourse = await getCourseById(Number(courseId));
                if (currentCourse) {
                  courseList = [currentCourse, ...courseList];
                }
              }
              if (currentCourse) {
                setSelectedCourse(currentCourse);
              }
            }
            setCourses(courseList);
          }
        } catch (error) {
          console.error("Fetch courses error:", error);
        }
      };
      fetchCourses();
    }, [courseId]),
  );

  // Fetch students when course or session changes
  useFocusEffect(
    useCallback(() => {
      if (!selectedCourse) return;

      const fetchData = async () => {
        setLoading(true);
        try {
          const today = getLocalDateString();
          const [studentsRes, attendanceRes] = await Promise.all([
            getCourseStudents(selectedCourse.id),
            getCourseAttendance(selectedCourse.id, today),
          ]);

          const activeStudents = (studentsRes || []).filter(
            (s: any) => s.isActive && s.educationalStatus === "enrolled",
          );

          // Merge students with existing attendance records for the selected session
          const attendanceMap = new Map();
          const sessionRecords = Array.isArray(attendanceRes)
            ? attendanceRes.filter((r: any) => r.session === selectedSession)
            : [];

          sessionRecords.forEach((r: any) => attendanceMap.set(String(r.studentId), r));

          const mergedStudents = activeStudents.map((s: any) => ({
            ...s,
            status: attendanceMap.get(String(s.id))?.status || "absent",
            notes: attendanceMap.get(String(s.id))?.notes || "",
          }));

          if (isStudent) {
            setIsEditing(false);
            const currentUser = session?.user as any;
            const ownStudent = mergedStudents.find(
              (s: any) =>
                s.userId === currentUser?.id ||
                s.studentCode === currentUser?.studentCode ||
                s.id === currentUser?.studentId,
            );
            setStudents(ownStudent ? [ownStudent] : []);
          } else if (sessionRecords.length > 0) {
            setIsEditing(false);
            setStudents(mergedStudents);
          } else {
            setIsEditing(accessCheck.canEdit);
            setStudents(mergedStudents);
          }

          setSaved(false);
        } catch (error) {
          console.error("Fetch data error:", error);
          Alert.alert("Error", "Failed to fetch students or attendance.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [
      selectedCourse,
      selectedSession,
      accessCheck.canEdit,
      isStudent,
      session?.user?.id,
    ]),
  );

  const filtered = useMemo(() => {
    const searchLower = (search || "").toLowerCase();
    return students.filter(
      (s) =>
        (s.name?.toLowerCase() || "").includes(searchLower) ||
        (s.studentCode?.toLowerCase() || "").includes(searchLower),
    );
  }, [search, students]);

  const setStatus = (id: any, status: AttendanceStatusEnum) => {
    if (!isEditing) return;
    setStudents((prev) =>
      prev.map((s) =>
        String(s.id) === String(id) ? { ...s, status: s.status === status ? null : status } : s,
      ),
    );
    setSaved(false);
  };

  const setNotes = (id: any, notes: string) => {
    if (!isEditing) return;
    setStudents((prev) => prev.map((s) => (String(s.id) === String(id) ? { ...s, notes } : s)));
    setSaved(false);
  };

  const markAllPresent = () => {
    if (!isEditing) return;
    setStudents((prev) => prev.map((s) => ({ ...s, status: "present" })));
    setSaved(false);
  };

  const clearAll = () => {
    if (!isEditing) return;
    setStudents((prev) => prev.map((s) => ({ ...s, status: "absent" })));
    setSaved(false);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      Alert.alert("Wait", "Please select a course first.");
      return;
    }

    if (!accessCheck.canEdit) {
      Alert.alert("Access Denied", accessCheck.reason);
      return;
    }

    const unMarkedCount = students.filter((s) => !s.status).length;
    if (unMarkedCount > 0) {
      Alert.alert(
        "Incomplete",
        `There are ${unMarkedCount} students not marked. Do you want to continue?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => submitAttendance() },
        ],
      );
    } else {
      submitAttendance();
    }
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
      const payload = {
        courseId: selectedCourse.id,
        date: getLocalDateString(),
        session: selectedSession,
        academicYearId: selectedCourse.academicYearId,
        facultyId: selectedCourse.schedule?.facultyId,
        departmentId: selectedCourse.schedule?.departmentId,
        mark: students
          .filter((s) => s.status) // Only send students with a status
          .map((s) => ({
            studentId: s.id,
            status: s.status,
            notes: s.notes || "",
          })),
      };

      await markBulkAttendance(payload);
      setSaved(true);
      Alert.alert("Success", "Attendance has been saved successfully.");
    } catch (error: any) {
      console.error("Save attendance error:", error);
      const message =
        error.response?.data?.message || "Failed to save attendance.";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  const total = students.length;
  const present = students.filter((s) => s.status === "present").length;
  const absent = students.filter((s) => s.status === "absent").length;
  const late = students.filter((s) => s.status === "late").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={stylesheet.safe}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title={t("attendance.recordTitle") || "Attendance"}
        showBack
      />
      <ScrollView
        style={stylesheet.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={stylesheet.header}>
          <TouchableOpacity
            style={stylesheet.courseSelector}
            onPress={() => setCourseModalVisible(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={stylesheet.className}>
                {selectedCourse
                  ? `${selectedCourse.name} - ${selectedCourse.code}`
                  : "Select Course..."}
              </Text>
              <Text style={stylesheet.classSub}>
                {selectedCourse
                  ? `${selectedCourse.schedule?.faculty?.name} • Year ${selectedCourse.schedule?.year}`
                  : "Choose a subject to start recording"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>

          {!isStudent && (
            <View style={stylesheet.sessionRow}>
              <TouchableOpacity
                style={[
                  stylesheet.sessionBtn,
                  selectedSession === 1 && stylesheet.sessionBtnActive,
                ]}
                onPress={() => setSelectedSession(1)}
              >
                <Text
                  style={[
                    stylesheet.sessionBtnText,
                    selectedSession === 1 && stylesheet.sessionBtnTextActive,
                  ]}
                >
                  Session 1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  stylesheet.sessionBtn,
                  selectedSession === 2 && stylesheet.sessionBtnActive,
                ]}
                onPress={() => setSelectedSession(2)}
              >
                <Text
                  style={[
                    stylesheet.sessionBtnText,
                    selectedSession === 2 && stylesheet.sessionBtnTextActive,
                  ]}
                >
                  Session 2
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={stylesheet.headerDateRow}>
            <Text style={stylesheet.dateText}>
              {isStudent ? "Attendance summary" : `Record for ${dateStr}`}
            </Text>
            {!isStudent && <Text style={stylesheet.timeText}>{timeStr}</Text>}
          </View>
        </View>

        {!accessCheck.canEdit && selectedCourse && (
          <View style={stylesheet.calloutBox}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.error}
            />
            <Text style={stylesheet.calloutText}>{accessCheck.reason}</Text>
          </View>
        )}

        {!isStudent && (
          <View style={stylesheet.searchBox}>
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={stylesheet.searchInput}
              placeholder="Search students by name or ID..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}

        {!isStudent && (
          <View style={[stylesheet.actionRow, !isEditing && { opacity: 0.5 }]}>
            <TouchableOpacity
              style={stylesheet.btnPresent}
              onPress={markAllPresent}
              disabled={!isEditing}
            >
              <Ionicons name="checkmark" size={16} color={colors.success} />
              <Text style={stylesheet.btnPresentText}>Mark All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={stylesheet.btnClear}
              onPress={clearAll}
              disabled={!isEditing}
            >
              <Ionicons name="close" size={16} color={colors.error} />
              <Text style={stylesheet.btnClearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {isStudent && selectedCourse && (
          <View style={stylesheet.card}>
            <Text style={stylesheet.cardTitle}>Your Subject</Text>
            <Text style={stylesheet.studentName}>{selectedCourse.name}</Text>
            <Text style={stylesheet.studentMeta}>{selectedCourse.code}</Text>
            <Text style={stylesheet.studentMeta}>
              Status: {students[0]?.status || "Pending"}
            </Text>
          </View>
        )}

        {!isStudent && (
          <View style={stylesheet.card}>
            <Text style={stylesheet.cardTitle}>Student List</Text>
            {loading ? (
              <View style={stylesheet.noResult}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[stylesheet.noResultText, { marginTop: 10 }]}>
                  Loading students...
                </Text>
              </View>
            ) : !selectedCourse ? (
              <View style={stylesheet.noResult}>
                <Ionicons
                  name="school-outline"
                  size={40}
                  color={colors.border}
                />
                <Text style={[stylesheet.noResultText, { marginTop: 10 }]}>
                  Please select a course to see students.
                </Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={stylesheet.noResult}>
                <Text style={stylesheet.noResultText}>
                  No students matched your search.
                </Text>
              </View>
            ) : (
              filtered.map((student, index) => (
                <View key={student.id}>
                  {index > 0 && <View style={stylesheet.divider} />}
                  <View style={stylesheet.studentRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={stylesheet.studentName}>{student.name}</Text>
                      <Text style={stylesheet.studentMeta}>
                        ID: {student.studentCode} • Gender: {student.gender}
                      </Text>
                      <View style={stylesheet.statusRow}>
                        {(
                          ["present", "absent", "late", "excused"] as any[]
                        ).map((s) => (
                          <TouchableOpacity
                            key={s as string}
                            style={stylesheet.checkItem}
                            onPress={() => setStatus(student.id, s)}
                          >
                            <View
                              style={[
                                stylesheet.checkbox,
                                student.status === s &&
                                  (s === "present"
                                    ? stylesheet.checkPresent
                                    : s === "absent"
                                      ? stylesheet.checkAbsent
                                      : s === "late"
                                        ? stylesheet.checkLate
                                        : stylesheet.checkExcused),
                              ]}
                            >
                              {student.status === s && (
                                <Ionicons
                                  name="checkmark"
                                  size={11}
                                  color="white"
                                />
                              )}
                            </View>
                            <Text style={stylesheet.checkLabel}>
                              {s === "present"
                                ? "Present"
                                : s === "absent"
                                  ? "Absent"
                                  : s === "late"
                                    ? "Late"
                                    : "Excused"}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TextInput
                        style={stylesheet.notesInput}
                        placeholder="Add a note..."
                        placeholderTextColor={colors.textSecondary}
                        value={student.notes}
                        onChangeText={(text) => setNotes(student.id, text)}
                        editable={isEditing}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={stylesheet.card}>
          <Text style={stylesheet.cardTitle}>Attendance Summary</Text>
          <View style={stylesheet.summaryGrid}>
            <View style={stylesheet.summaryItem}>
              <Text style={[stylesheet.summaryNum, { color: colors.primary }]}>
                {total}
              </Text>
              <Text style={stylesheet.summaryLabel}>Total Students</Text>
            </View>
            <View style={stylesheet.summaryItem}>
              <Text style={[stylesheet.summaryNum, { color: colors.success }]}>
                {present}
              </Text>
              <Text style={stylesheet.summaryLabel}>Present</Text>
            </View>
            <View style={stylesheet.summaryItem}>
              <Text style={[stylesheet.summaryNum, { color: colors.error }]}>
                {absent}
              </Text>
              <Text style={stylesheet.summaryLabel}>Absent</Text>
            </View>
            <View style={stylesheet.summaryItem}>
              <Text style={[stylesheet.summaryNum, { color: colors.warning }]}>
                {late}
              </Text>
              <Text style={stylesheet.summaryLabel}>Late</Text>
            </View>
          </View>
          <View style={stylesheet.rateDivider} />
          <View style={stylesheet.rateRow}>
            <Text style={stylesheet.rateLabel}>Attendance Rate</Text>
            <Text
              style={[
                stylesheet.rateValue,
                {
                  color: rate >= 80 ? colors.success : colors.error,
                },
              ]}
            >
              {rate}%
            </Text>
          </View>
        </View>

        {!isStudent && (
          <TouchableOpacity
            style={[stylesheet.historyBtn, !selectedCourse && { opacity: 0.5 }]}
            onPress={() => {
              if (!selectedCourse) {
                Alert.alert(
                  "Wait",
                  "Please select a course to view its report.",
                );
                return;
              }
              router.push({
                pathname: "/(tabs)/attendance/attendance-history",
                params: { courseId: selectedCourse.id },
              });
            }}
            disabled={!selectedCourse}
          >
            <Text style={stylesheet.historyBtnText}>Attendance Report</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}

        {!isStudent &&
        !isEditing &&
        accessCheck.canEdit &&
        selectedCourse &&
        students.length > 0 ? (
          <TouchableOpacity
            style={stylesheet.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={stylesheet.editBtnText}>Edit Attendance</Text>
          </TouchableOpacity>
        ) : !isStudent && isEditing ? (
          <TouchableOpacity
            style={[
              stylesheet.saveBtn,
              saved && stylesheet.saveBtnDone,
              submitting && { opacity: 0.7 },
            ]}
            onPress={handleSaveAttendance}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons
                name={saved ? "checkmark-circle" : "checkmark-circle-outline"}
                size={18}
                color="white"
              />
            )}
            <Text style={stylesheet.saveBtnText}>
              {submitting
                ? "Saving..."
                : saved
                  ? "Attendance Saved!"
                  : "Save Attendance"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Course Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={courseModalVisible}
          onRequestClose={() => setCourseModalVisible(false)}
        >
          <View style={stylesheet.modalOverlay}>
            <View style={stylesheet.modalContent}>
              <View style={stylesheet.modalHeader}>
                <Text style={stylesheet.modalTitle}>Select Course</Text>
                <TouchableOpacity onPress={() => setCourseModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={courses}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      stylesheet.courseItem,
                      selectedCourse?.id === item.id &&
                        stylesheet.courseItemActive,
                    ]}
                    onPress={() => {
                      setSelectedCourse(item);
                      setCourseModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        stylesheet.courseItemName,
                        selectedCourse?.id === item.id &&
                          stylesheet.courseItemNameActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={stylesheet.courseItemCode}>{item.code}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={stylesheet.emptyCourses}>
                    <Text style={stylesheet.emptyCoursesText}>
                      No courses assigned to you.
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

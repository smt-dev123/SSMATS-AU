import { getDashboardSummaryMe } from "@/api/DashboardAPI";
import { getStudentMe } from "@/api/StudentAPI";
import { getTeacherMe } from "@/api/TeacherAPI";
import { useNotification } from "@/src/contexts/NotificationContext";
import { useSession } from "@/lib/auth-client";
import api from "@/lib/axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

function getGreeting(t: any) {
  const h = new Date().getHours();
  if (h < 12) return t("dashboard.greetingMorning");
  if (h < 17) return t("dashboard.greetingAfternoon");
  return t("dashboard.greetingEvening");
}

function getCurrentDate() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

const STAT_ICONS = {
  subjects: require("@/assets/images/icons/subjects.png"),
  completed: require("@/assets/images/icons/completed.png"),
  classes: require("@/assets/images/icons/class.png"),
  today: require("@/assets/images/icons/todayclass.png"),
};

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("file://")) return path;
  const baseURL = api.defaults.baseURL || "http://localhost:3000/api";
  return `${baseURL}${path}`.replace("/api", "");
};

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const stylesheet = getStyles(colors);
  const { data: session, isPending: isSessionLoading } = useSession();

  const isStudent = (session?.user as any)?.role === "student";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { notifications } = useNotification();

  const STATS = [
    {
      label: t("dashboard.totalSubjects"),
      value: stats?.totalSubjects?.toString() || "0",
      icon: STAT_ICONS.subjects,
      color: colors.text,
      bg: colors.card,
    },
    {
      label: t("dashboard.completed"),
      value: stats?.completed?.toString() || "0",
      icon: STAT_ICONS.completed,
      color: colors.text,
      bg: colors.card,
    },
    {
      label: t("dashboard.totalClasses"),
      value: stats?.totalClasses?.toString() || "0",
      icon: STAT_ICONS.classes,
      color: colors.text,
      bg: colors.card,
    },
    {
      label: t("dashboard.todayClasses"),
      value: stats?.todayClasses?.toString() || "0",
      icon: STAT_ICONS.today,
      color: colors.text,
      bg: colors.card,
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (isSessionLoading) return;
        setLoading(true);
        try {
          const res = await getDashboardSummaryMe();
          if (res) {
            setStats(res.stats);
            setCurrentClass(res.currentClass);
          }

          if (session?.user) {
            const role = (session.user as any).role;
            let profileData;
            if (role === "teacher") {
              profileData = await getTeacherMe();
            } else if (role === "student") {
              profileData = await getStudentMe();
            }
            setProfile(profileData);
          }
        } catch (error: any) {
          console.error(
            "Dashboard fetch error:",
            error.response?.data || error.message || error,
          );
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [session, isSessionLoading]),
  );

  if (loading || isSessionLoading) {
    return (
      <SafeAreaView style={stylesheet.safe}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={stylesheet.safe}>
      <ScrollView
        style={stylesheet.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={stylesheet.header}>
          <View style={stylesheet.headerLeft}>
            <Text style={stylesheet.greeting}>{getGreeting(t)},</Text>
            <Text style={stylesheet.userName}>{profile?.name || "User"}!</Text>
            <Text style={stylesheet.date}>{getCurrentDate()}</Text>
          </View>

          <View style={stylesheet.headerRight}>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              {profile?.image ? (
                <Image
                  source={{ uri: getImageUrl(profile.image) || undefined }}
                  style={stylesheet.avatarImg}
                />
              ) : (
                <View style={stylesheet.avatar}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {profile?.name?.substring(0, 2) || "U"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats Grid ── */}
        <View style={stylesheet.statsGrid}>
          {STATS.map((s, i) => (
            <View
              key={i}
              style={[stylesheet.statCard, { backgroundColor: s.bg }]}
            >
              <View style={stylesheet.statTop}>
                <Text style={stylesheet.statLabel}>{s.label}</Text>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    padding: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: s.color + "22",
                  }}
                >
                  <Image
                    source={s.icon}
                    style={stylesheet.statIconImg}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text style={[stylesheet.statValue, { color: s.color }]}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Current Class Card ── */}
        <View style={stylesheet.currentCard}>
          <View style={stylesheet.currentCardTop}>
            <View>
              <Text style={stylesheet.currentTitle}>
                {t("dashboard.currentClass")}
              </Text>
              <Text style={stylesheet.currentSub}>
                {currentClass
                  ? t("dashboard.inProgress")
                  : t("dashboard.noClass")}
              </Text>
            </View>
            <View style={stylesheet.currentIconBox}>
              <Text style={stylesheet.currentIcon}>🕐</Text>
            </View>
          </View>
          {currentClass ? (
            <>
              <Text style={stylesheet.subjectName}>{currentClass.name}</Text>
              <Text style={stylesheet.classInfo}>
                {currentClass.startTime} - {currentClass.endTime}{" "}
                {currentClass.building} {currentClass.room}
              </Text>
              <TouchableOpacity
                style={stylesheet.recordBtn}
                onPress={() => {
                  if (isStudent) {
                    router.push({
                      pathname: "/(tabs)/attendance/attendance-history",
                      params: currentClass?.id
                        ? { courseId: String(currentClass.id) }
                        : undefined,
                    });
                  } else {
                    router.push({
                      pathname: "/(tabs)/attendance",
                      params: currentClass?.id
                        ? { courseId: String(currentClass.id) }
                        : undefined,
                    });
                  }
                }}
              >
                <Text style={stylesheet.recordBtnText}>
                  ✓{" "}
                  {isStudent
                    ? t("dashboard.viewAttendance", "View Attendance")
                    : t("dashboard.recordAttendance")}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={stylesheet.subjectName}>
              {t("dashboard.freeTime")}
            </Text>
          )}
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity 
            style={stylesheet.notificationCard}
            onPress={() => router.push("/(tabs)/notification")}
            activeOpacity={0.8}
          >
            <View style={stylesheet.notificationHeader}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <Text style={stylesheet.notificationTitle}>{t("dashboard.latestNotification", "Latest Notification")}</Text>
            </View>
            <Text style={stylesheet.notificationSubject}>{notifications[0].title}</Text>
            <Text style={stylesheet.notificationBody} numberOfLines={2}>{notifications[0].message}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 16,
      paddingBottom: 20,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      alignItems: "flex-end",
      width: "47%",
    },
    greeting: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    userName: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      marginTop: 2,
    },
    date: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    avatarImg: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      width: "47%",
      borderRadius: 16,
      padding: 16,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    statTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      maxWidth: "70%",
    },
    statIconImg: {
      width: 22,
      height: 22,
    },
    statValue: {
      fontSize: 28,
      fontWeight: "800",
    },
    currentCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    },
    currentCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    currentTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    currentSub: {
      fontSize: 12,
      color: "#ffffffaa",
      marginTop: 2,
    },
    currentIconBox: {
      backgroundColor: "#ffffff22",
      borderRadius: 10,
      padding: 8,
    },
    currentIcon: { fontSize: 20 },
    subjectName: {
      fontSize: 28,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 6,
    },
    classInfo: {
      fontSize: 12,
      color: "#ffffffcc",
      marginBottom: 18,
    },
    recordBtn: {
      backgroundColor: "#fff",
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
    },
    recordBtnText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 15,
    },
    notificationCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginLeft: 8,
    },
    notificationSubject: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    notificationBody: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

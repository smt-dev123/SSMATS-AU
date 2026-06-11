import { getStudentMe } from "@/api/StudentAPI";
import { getTeacherMe } from "@/api/TeacherAPI";
import { signOut, useSession } from "@/lib/auth-client";
import api from "@/lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const PLACEHOLDER_IMAGE = require("@/assets/images/icons/user.png");

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseURL = api.defaults.baseURL || "http://localhost:3000/api";
  return `${baseURL}${path}`.replace("/api", "");
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const stylesheet = getStyles(colors);

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={stylesheet.infoRow}>
      <Text style={stylesheet.label}>{label}</Text>
      <Text style={stylesheet.value}>{value}</Text>
    </View>
  );

  const { data: session, isPending: isSessionLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    dob: "",
    photoUri: null as string | null,
    role: "",
    code: "",
    faculty: "",
    department: "",
    academicLevel: "",
  });

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        if (isSessionLoading) return;
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const userRole = (session.user as any).role;

        try {
          let data;
          if (userRole === "teacher") {
            data = await getTeacherMe();
            setProfile({
              fullName: data.name,
              phone: data.phone,
              email: data.email,
              address: data.address || "",
              dob: "",
              photoUri: getImageUrl(data.image),
              role: t("profile.teacher"),
              code: data.teacherCode,
              faculty: data.faculty?.name || "",
              academicLevel: data.academicLevel?.level || "",
              department: "",
            });
          } else if (userRole === "student") {
            data = await getStudentMe();
            setProfile({
              fullName: data.name,
              phone: data.phone,
              email: data.email,
              address: data.address || "",
              dob: data.dob ? new Date(data.dob).toLocaleDateString() : "",
              photoUri: getImageUrl(data.image),
              role: t("profile.student"),
              code: data.studentCode,
              faculty: data.faculty?.name || "",
              department: data.department?.name || "",
              academicLevel: "",
            });
          } else {
            // Admin or other roles
            const user = session.user as any;
            setProfile((prev) => ({
              ...prev,
              fullName: user.name || "",
              email: user.email || "",
              photoUri: getImageUrl(user.image),
              role: userRole || "",
            }));
          }
        } catch (e) {
          console.log("Load error:", e);
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }, [session, isSessionLoading, t]),
  );

  const handleLogout = () => {
    Alert.alert(t("dashboard.signOut"), t("dashboard.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("dashboard.signOut"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            await AsyncStorage.removeItem("sessionToken");
            router.replace("/");
          } catch (err) {
            console.error("Logout error:", err);
            await AsyncStorage.removeItem("sessionToken");
            // Even if sign out fails on server, we should probably force redirect
            router.replace("/");
          }
        },
      },
    ]);
  };

  if (loading || isSessionLoading) {
    return (
      <View
        style={[
          stylesheet.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={stylesheet.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={stylesheet.profileHeader}>
        <View style={stylesheet.headerTop}>
          <TouchableOpacity
            style={stylesheet.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={stylesheet.avatarContainer}>
          <Image
            source={
              profile.photoUri ? { uri: profile.photoUri } : PLACEHOLDER_IMAGE
            }
            style={stylesheet.avatar}
          />
        </View>
        <Text style={stylesheet.userName}>{profile.fullName || "N/A"}</Text>
        <Text style={stylesheet.userRole}>{profile.role || "User"}</Text>
      </View>

      {/* Basic Information */}
      <View style={stylesheet.card}>
        <View style={stylesheet.cardHeader}>
          <Ionicons
            name="person-circle-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={stylesheet.cardTitle}>{t("profile.basicInfo")}</Text>
        </View>
        <InfoRow
          label={t("profile.fullName")}
          value={profile.fullName || "N/A"}
        />
        {profile.dob ? (
          <InfoRow label={t("profile.dob")} value={profile.dob} />
        ) : null}
        <InfoRow
          label={
            profile.role === t("profile.teacher")
              ? t("profile.teacherCode")
              : t("profile.studentCode")
          }
          value={profile.code || "N/A"}
        />
      </View>

      {/* Academic Information */}
      {(profile.faculty || profile.department || profile.academicLevel) && (
        <View style={stylesheet.card}>
          <View style={stylesheet.cardHeader}>
            <Ionicons
              name="school-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={stylesheet.cardTitle}>
              {t("profile.academicInfo")}
            </Text>
          </View>
          {profile.faculty ? (
            <InfoRow label={t("profile.faculty")} value={profile.faculty} />
          ) : null}
          {profile.department ? (
            <InfoRow
              label={t("profile.department")}
              value={profile.department}
            />
          ) : null}
          {profile.academicLevel ? (
            <InfoRow
              label={t("profile.academicLevel")}
              value={profile.academicLevel}
            />
          ) : null}
        </View>
      )}

      {/* Contact Information */}
      <View style={stylesheet.card}>
        <View style={stylesheet.cardHeader}>
          <Ionicons
            name="call-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={stylesheet.cardTitle}>{t("profile.contactInfo")}</Text>
        </View>
        <InfoRow label={t("profile.phone")} value={profile.phone || "N/A"} />
        <InfoRow label={t("profile.email")} value={profile.email || "N/A"} />
        <InfoRow
          label={t("profile.address")}
          value={profile.address || "N/A"}
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={stylesheet.btnEdit}
        onPress={() => router.push("/(tabs)/profile/edit-profile")}
      >
        <Text style={stylesheet.btnEditText}>{t("profile.editProfile")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={stylesheet.logoutBtn} onPress={handleLogout}>
        <Text style={stylesheet.logoutText}>{t("profile.logout")}</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  userRole: {
    color: "#E0E0E0",
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 20,
  },
  btnEdit: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnEditText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: "center",
  },
  logoutText: {
    color: colors.error,
    fontWeight: "bold",
  },
});

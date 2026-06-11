import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import api from "@/lib/axios";
import { getTeacherMe, updateTeacherMe } from "@/api/TeacherAPI";
import { getStudentMe, updateStudentMe } from "@/api/StudentAPI";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("file://")) return path;
  const baseURL = api.defaults.baseURL || "http://localhost:3000/api";
  return `${baseURL}${path}`.replace("/api", "");
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (isSessionLoading) return;
      if (!session?.user) {
        setLoadingData(false);
        return;
      }
      try {
        let data;
        const userRole = (session.user as any).role;
        if (userRole === "teacher") {
          data = await getTeacherMe();
        } else if (userRole === "student") {
          data = await getStudentMe();
        }

        if (data) {
          setFullName(data.name || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAddress(data.address || "");
          setGender(data.gender || "");
          if (data.dob) {
            const date = new Date(data.dob);
            if (!isNaN(date.getTime())) {
              setDob(date.toISOString().split("T")[0]);
            }
          }
          setPhotoUri(getImageUrl(data.image));
        } else {
          setFullName(session.user.name || "");
          setPhone((session.user as any).phone || "");
          setEmail(session.user.email || "");
          setAddress((session.user as any).address || "");
          setGender((session.user as any).gender || "");
          if ((session.user as any).dob) {
            const date = new Date((session.user as any).dob);
            if (!isNaN(date.getTime())) {
              setDob(date.toISOString().split("T")[0]);
            }
          }
          setPhotoUri(getImageUrl(session.user.image));
        }
      } catch (e) {
        console.log("Load error:", e);
        setFullName(session.user.name || "");
        setEmail(session.user.email || "");
        setPhotoUri(getImageUrl(session.user.image));
      } finally {
        setLoadingData(false);
      }
    };
    loadProfile();
  }, [session, isSessionLoading]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("common.error"), t("editProfile.allowPhotos"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("common.error"), t("editProfile.allowCamera"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(t("editProfile.changePhoto"), "", [
      { text: "📷 " + t("editProfile.takePhoto"), onPress: handleTakePhoto },
      {
        text: "🖼️ " + t("editProfile.chooseGallery"),
        onPress: handlePickImage,
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      Alert.alert("⚠️ " + t("common.error"), t("editProfile.errorMsg"));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("gender", gender);
      if (dob) formData.append("dob", dob);

      if (photoUri && !photoUri.startsWith("http")) {
        const filename = photoUri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("image", {
          uri: photoUri,
          name: filename,
          type,
        } as any);
      }

      const userRole = (session?.user as any)?.role;
      if (userRole === "teacher") {
        await updateTeacherMe(formData);
      } else if (userRole === "student") {
        await updateStudentMe(formData);
      }

      await authClient.updateUser({
        name: fullName,
        phone: phone,
        address: address,
        gender: gender,
        dob: dob,
      } as any);

      Alert.alert("✅ " + t("common.ok"), t("editProfile.successMsg"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        "❌ " + t("common.error"),
        t("editProfile.errorMsg") + " — " + e,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#00529B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("editProfile.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={handleChangePhoto}
          style={styles.avatarWrapper}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleChangePhoto}
          style={styles.changePhotoBtn}
        >
          <Text style={styles.changePhotoText}>
            {t("editProfile.changePhoto")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personal Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={20} color="#00529B" />
          <Text style={styles.cardTitle}>{t("editProfile.personalInfo")}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("profile.fullName")} *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("profile.gender")}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === "male" && styles.genderBtnActive,
              ]}
              onPress={() => setGender("male")}
            >
              <Text
                style={[
                  styles.genderBtnText,
                  gender === "male" && styles.genderBtnTextActive,
                ]}
              >
                {t("common.male")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                gender === "female" && styles.genderBtnActive,
              ]}
              onPress={() => setGender("female")}
            >
              <Text
                style={[
                  styles.genderBtnText,
                  gender === "female" && styles.genderBtnTextActive,
                ]}
              >
                {t("common.female")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("profile.dob")}</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#bbb"
          />
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call-outline" size={20} color="#00529B" />
          <Text style={styles.cardTitle}>{t("editProfile.contactInfo")}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("profile.phone")} *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+855 XX XXX XXX"
            placeholderTextColor="#bbb"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("profile.email")} *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@university.edu"
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("profile.address")}</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>{t("editProfile.save")}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>{t("editProfile.cancel")}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#00529B",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#00529B",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarWrapper: { position: "relative", marginBottom: 10 },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "#00529B" },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9800",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  changePhotoText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#00529B" },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  genderContainer: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  genderBtnActive: {
    borderColor: "#00529B",
    backgroundColor: "#E3F2FD",
  },
  genderBtnText: { color: "#666", fontWeight: "600" },
  genderBtnTextActive: { color: "#00529B" },
  saveBtn: {
    backgroundColor: "#00529B",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelBtnText: { color: "#888", fontSize: 15 },
});

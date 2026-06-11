import CustomInput from "@/components/ui/CustomInput";
import { signIn } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const REMEMBER_ME_KEY = "remember_user_email";

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const stylesheet = getStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (err) {
        console.log("Error loading saved email", err);
      }
    };
    loadSavedEmail();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t("login.errorEmpty") || "សូមបំពេញអ៊ីមែល និង លេខសម្ងាត់");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await signIn.email({
        email: email.trim(),
        password: password,
        callbackURL: "/dashboard",
      });

      if (authError) {
        setError(authError.message || "ការចូលប្រើប្រាស់មិនជោគជ័យ");
        return;
      }

      if (data?.token) {
        await AsyncStorage.setItem("sessionToken", data.token);
      }

      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      }

      // Successful login - navigation is usually handled by better-auth or manually
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      console.error(e);
      setError("មានបញ្ហាបច្ចេកទេសក្នុងការតភ្ជាប់");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={stylesheet.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("@/assets/images/images/image.png")}
        style={stylesheet.bgImage}
        resizeMode="cover"
      >
        <View style={stylesheet.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={stylesheet.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={stylesheet.header}>
                <View style={stylesheet.logoContainer}>
                  <View style={stylesheet.logoWrapper}>
                    <Image
                      source={require("@/assets/images/images/logo.png")}
                      style={stylesheet.logo}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <Text style={stylesheet.titleKh}>
                  {t("login.title") || "ចូលប្រើប្រាស់"}
                </Text>
                <Text style={stylesheet.titleEn}>
                  ACADEMIC MANAGEMENT SYSTEM
                </Text>
              </View>

              <View style={stylesheet.glassCard}>
                <View style={stylesheet.cardHeader}>
                  <Text style={stylesheet.cardTitle}>LOGIN</Text>
                  <View style={stylesheet.cardSubtitleUnderline} />
                </View>

                <CustomInput
                  label={t("login.email") || "អ៊ីមែល / Email"}
                  placeholder={
                    t("login.emailPlaceholder") || "example@email.com"
                  }
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomInput
                  label={t("login.password") || "លេខសម្ងាត់ / Password"}
                  placeholder={t("login.passwordPlaceholder") || "••••••••"}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError("");
                  }}
                />

                {error !== "" && (
                  <View style={stylesheet.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#FF3B30" />
                    <Text style={stylesheet.errorText}>{error}</Text>
                  </View>
                )}

                <View style={stylesheet.rowActions}>
                  <TouchableOpacity
                    style={stylesheet.rememberMe}
                    activeOpacity={0.7}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View
                      style={[
                        stylesheet.checkbox,
                        rememberMe && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    <Text style={stylesheet.rememberText}>
                      {t("login.rememberMe") || "ចងចាំខ្ញុំ"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={stylesheet.forgotPass}>
                    <Text style={stylesheet.forgotText}>
                      {t("login.forgotPassword") || "ភ្លេចលេខសម្ងាត់?"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[stylesheet.loginBtn, loading && { opacity: 0.8 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={stylesheet.loginBtnContent}>
                      <Text style={stylesheet.loginBtnText}>
                        {t("login.loginBtn") || "ចូលប្រព័ន្ធ"}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#fff"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={stylesheet.footer}>
                <Text style={stylesheet.footerText}>
                  © {new Date().getFullYear()} Angkore University. All rights
                  reserved.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  bgImage: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 60,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    padding: 10,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 20,
  },
  logoWrapper: {
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  logo: { width: 90, height: 90 },
  titleKh: {
    fontSize: 28,
    fontFamily: "MoulRegular",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleEn: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardHeader: {
    marginBottom: 25,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  cardSubtitleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 2,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  errorText: {
    color: "#D00000",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  rowActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  rememberText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  forgotPass: { alignSelf: "center" },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    textAlign: "center",
  },
});

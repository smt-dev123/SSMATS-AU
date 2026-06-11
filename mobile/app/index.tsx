import { getStyles } from "@/styles/index.style";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const stylesheet = getStyles(colorScheme);

  return (
    <ImageBackground
      source={require("@/assets/images/images/image.png")}
      style={stylesheet.container}
      resizeMode="cover"
    >
      <View style={stylesheet.overlay}>
        <SafeAreaView style={stylesheet.content}>
          {/* Logo Section */}
          <View style={stylesheet.logoContainer}>
            <Image
              source={require("@/assets/images/images/logo.png")}
              style={stylesheet.logo}
              resizeMode="contain"
            />
            <Text style={stylesheet.uniName}>សាកលវិទ្យាល័យអង្គរ</Text>
            <Text style={stylesheet.uniNameEn}>ANGKOR UNIVERSITY</Text>
            <View style={stylesheet.divider} />
            <Text style={stylesheet.tagline}>
              ប្រព័ន្ធគ្រប់គ្រងកាលវិភាគសិក្សា​ និង​សម្រង់វត្តមាននិសិត្ស
            </Text>
          </View>

          {/* Button Section — Glass Style */}
          <View style={stylesheet.buttonContainer}>
            <TouchableOpacity
              style={stylesheet.glassBtn}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.75}
            >
              <View style={stylesheet.btnInner}>
                <Text style={stylesheet.btnText}>
                  {t("welcome.loginBtn") || "ចូលប្រើប្រាស់"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={stylesheet.footer}>{t("welcome.footer")}</Text>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

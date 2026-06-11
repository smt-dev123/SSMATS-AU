import en from "@/lib/i18n/locales/en.json";
import km from "@/lib/i18n/locales/km.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import i18n from "i18next";
import { useEffect, useState } from "react";
import { initReactI18next } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

const LANG_KEY = "app_language";

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded] = useFonts({
    MoulRegular: require("@/assets/images/fonts/Moul/Moul-Regular.ttf"),
  });

  useEffect(() => {
    const setup = async () => {
      let savedLang = "km";
      try {
        const stored = await AsyncStorage.getItem(LANG_KEY);
        if (stored === "en" || stored === "km") savedLang = stored;
      } catch {}

      if (!i18n.isInitialized) {
        await i18n.use(initReactI18next).init({
          resources: {
            km: { translation: km },
            en: { translation: en },
          },
          lng: savedLang,
          fallbackLng: "km",
          interpolation: { escapeValue: false },
        });
      } else {
        await i18n.changeLanguage(savedLang);
      }

      setI18nReady(true);
    };
    setup();
  }, []);

  if (!fontsLoaded || !i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00529B" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

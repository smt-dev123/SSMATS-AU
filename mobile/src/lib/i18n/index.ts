// src/i18n/index.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";

const LANG_KEY = "app_language";

// ✅ ប្ដូរភាសា + save ទៅ AsyncStorage
// ប្រើនៅ screen ណាក៏បាន
export const changeLanguage = async (lang: "km" | "en") => {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    console.log("changeLanguage error:", e);
  }
};

export default i18n;

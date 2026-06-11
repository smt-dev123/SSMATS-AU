import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const getStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-around",
      paddingVertical: 50,
      paddingHorizontal: 40,
    },
    logoContainer: {
      alignItems: "center",
    },
    logo: {
      width: 150,
      height: 150,
      marginBottom: 16,
    },
    uniName: {
      fontFamily: "MoulRegular",
      fontSize: 24,
      color: "#ffffff",
      textAlign: "center",
      lineHeight: 40,
    },
    uniNameEn: {
      fontSize: 15,
      color: "#ffffff",
      fontWeight: "bold",
      letterSpacing: 4,
      marginTop: 6,
    },
    divider: {
      width: 50,
      height: 2,
      backgroundColor: colors.secondary,
      marginVertical: 14,
      borderRadius: 2,
    },
    tagline: {
      fontSize: 14,
      color: "#ffffff",
      fontWeight: "bold",
      textAlign: "center",
      lineHeight: 24,
    },
    buttonContainer: {
      width: "100%",
      gap: 16,
      alignItems: "center",
    },
    glassBtn: {
      width: "75%",
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    btnInner: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.5)",
    },
    btnText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: 1,
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    footer: {
      color: "#ffffff88",
      fontSize: 12,
    },
  });
};


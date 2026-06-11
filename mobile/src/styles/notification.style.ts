import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const getStyles = (colorScheme: "light" | "dark") => {
  const colors = Colors[colorScheme];
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 55,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    markReadText: { color: "#E0E0E0", fontSize: 13 },
    listPadding: { padding: 15 },
    notiCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 15,
      marginBottom: 10,
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 5,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    unreadCard: {
      backgroundColor: colors.primary + "11",
      borderColor: colors.primary + "33",
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    notiContent: { flex: 1, marginLeft: 15 },
    notiHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    notiTitle: { fontWeight: "bold", fontSize: 15, color: colors.text },
    notiTime: { fontSize: 11, color: colors.textSecondary },
    notiDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginLeft: 5,
    },
    emptyContainer: { alignItems: "center", marginTop: 100 },
    emptyText: { marginTop: 10, color: colors.textSecondary, fontSize: 16 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};

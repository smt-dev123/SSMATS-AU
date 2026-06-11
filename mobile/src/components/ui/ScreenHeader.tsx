import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const stylesheet = getStyles(colors);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  return (
    <View style={stylesheet.header}>
      <View style={stylesheet.headerLeft}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={stylesheet.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={stylesheet.backPlaceholder} />
        )}
        <View style={stylesheet.titleGroup}>
          <Text style={stylesheet.headerTitle}>{title}</Text>
          {subtitle ? (
            <Text style={stylesheet.headerSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {rightAction ? (
        <View style={stylesheet.rightAction}>{rightAction}</View>
      ) : null}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  backPlaceholder: {
    width: 40,
    marginRight: 12,
  },
  titleGroup: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 13,
    marginTop: 4,
  },
  rightAction: {
    marginLeft: 12,
  },
});

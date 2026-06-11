import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    width: width / 2 - 30, // បែងចែកជា ២ ជួរ
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    // Shadow សម្រាប់ iOS & Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  value: { fontSize: 22, fontWeight: "bold", color: "#333" },
  label: { fontSize: 12, color: "#666", marginTop: 5 },
});

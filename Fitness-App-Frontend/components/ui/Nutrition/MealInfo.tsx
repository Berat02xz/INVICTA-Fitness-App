import React from "react";
import { View, StyleSheet } from "react-native";


export default function MealInfo({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
  },
});

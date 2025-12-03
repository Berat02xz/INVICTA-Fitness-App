import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Feature Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.backgroundColor,
  },
  text: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
});

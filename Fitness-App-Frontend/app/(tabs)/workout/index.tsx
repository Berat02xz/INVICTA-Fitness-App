import { Button } from "@react-navigation/elements";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LogoutUser } from "@/api/UserDataEndpoint";
import { theme } from "@/constants/theme";

export default function Workout() {


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Workout Screen!</Text>
      <TouchableOpacity onPress={() => LogoutUser()} style={styles.logoutButton} activeOpacity={0.7}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
  },
});

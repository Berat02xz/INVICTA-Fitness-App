import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LogoutUser } from "@/api/UserDataEndpoint";
import { theme } from "@/constants/theme";
import { useProStatus } from "@/hooks/useProStatus";

export default function Workout() {
  const { isPro, loading } = useProStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Workout Screen!</Text>
      
      {/* Show PRO badge if user has PRO */}
      {isPro && (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>⭐ PRO Member</Text>
        </View>
      )}
      
      {/* Show upgrade button if not PRO */}
      {!isPro && !loading && (
        <TouchableOpacity 
          onPress={() => router.push("/(auth)/SubscriptionCheck")} 
          style={styles.upgradeButton} 
          activeOpacity={0.7}
        >
          <Text style={styles.upgradeButtonText}>🚀 Upgrade to PRO</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        onPress={() => LogoutUser()} 
        style={styles.logoutButton} 
        activeOpacity={0.7}
      >
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
  proBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: theme.spacing.lg,
  },
  proBadgeText: {
    color: '#000',
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
  },
  upgradeButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  logoutButtonText: {
    color: theme.primary,
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
  },
});

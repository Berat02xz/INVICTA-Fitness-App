import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { User } from "@/models/User";
import database from "@/database/database";
import { useProStatus } from "@/hooks/useProStatus";

// Design Tokens matching the rest of the app
const D = {
  bg: "#000000",
  primary: "#AAFB05",
  text: "#FFFFFF",
  sub: "#666666",
  card: "#121212",
  cardAlt: "#1C1C1E",
};

export default function Workout() {
  const insets = useSafeAreaInsets();
  const { isPro } = useProStatus();
  const [userData, setUserData] = useState<any>({ name: "User" });
  const [greeting, setGreeting] = useState<string>("Hello");

  useEffect(() => {
    loadUserData();
    determineGreeting();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        setUserData(user);
      }
    } catch (e) {
      console.log("Error loading user for workout screen", e);
    }
  };

  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Good Night");
    else if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      
      {/* --- Top Bar --- */}
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push("/(tabs)/profile")}>
                <Text style={styles.avatarText}>{userData.name?.substring(0, 2).toUpperCase()}</Text>
            </TouchableOpacity>
            <View>
                <Text style={styles.greetingText}>{greeting},</Text>
                <Text style={styles.userName}>{userData.name}</Text>
            </View>
        </View>

        <TouchableOpacity 
            style={[styles.pill, isPro ? styles.proPill : styles.freePill]} 
            onPress={() => !isPro && router.push("/(auth)/SubscriptionCheck")}
            activeOpacity={0.8}
        >
            <Ionicons 
                name={isPro ? "star" : "lock-closed"} 
                size={12} 
                color={isPro ? "#000" : "#FFF"} 
                style={{marginRight: 4}} 
            />
            <Text style={[styles.pillText, !isPro && { color: "#FFF" }]}>
                {isPro ? "PRO" : "FREE"}
            </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Placeholder for future workout content */}
        <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={48} color={D.cardAlt} />
            <Text style={styles.emptyText}>Your workout plan will appear here.</Text>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: D.bg,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: D.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  avatarText: {
    fontFamily: theme.bold,
    color: "#FFF",
    fontSize: 16,
  },
  greetingText: {
    fontFamily: theme.medium,
    color: D.sub,
    fontSize: 12,
  },
  userName: {
    fontFamily: theme.bold,
    color: "#FFF",
    fontSize: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proPill: {
    backgroundColor: D.primary,
  },
  freePill: {
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
  },
  pillText: {
    fontFamily: theme.bold,
    fontSize: 12,
    color: "#000",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: D.sub,
    fontFamily: theme.medium,
    marginTop: 10,
  },
});

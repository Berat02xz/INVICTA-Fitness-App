import { getUserIdFromToken } from "@/api/tokenDecoder";
import { FetchUserInformationAndStore } from "@/api/UserData";
import database from "@/database/database";
import { User } from "@/models/User";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "@/constants/theme";
import CustomTabBar from "@/components/ui/CustomTapBar";

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.warn("[User] User ID is null. Cannot fetch.");
          setIsLoading(false);
          return;
        }

        let user = await User.getUserDetails(database);

        if (!user) {
          try {
            await FetchUserInformationAndStore(userId);
          } catch (error) {
            console.error("Error fetching user from BE:", error);
          }
          try {
            user = await User.getUserDetails(database);
          } catch (error) {
            console.error("Error fetching user from WatermelonDB:", error);
          }
        }

        setUserData(user);
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    console.warn("[User] No user data found.");
  }

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="chatbot/index"
          options={{
            title: "Chatbot",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/icons/navigation/chatbot.png")}
                style={[styles.icon, focused && styles.iconFocused]}
                resizeMode="contain"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="workout/index"
          options={{
            title: "Workout",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/icons/navigation/workout.png")}
                style={[styles.icon, focused && styles.iconFocused]}
                resizeMode="contain"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="nutrition/index"
          options={{
            title: "Nutrition",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("@/assets/icons/navigation/nutrition.png")}
                style={[styles.icon, focused && styles.iconFocused]}
                resizeMode="contain"
              />
            ),
          }}
        />

        {/* Hide all other pages so they don't show as tabs */}
        <Tabs.Screen
          name="nutrition/screens/scan"
          options={{ tabBarItemStyle: { display: "none" } }}
        />
      </Tabs>

      {/* Floating Scan Button on the Right */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("/nutrition/screens/scan")}
      >
        <Image
          source={require("@/assets/icons/navigation/scan.png")}
          style={styles.scanIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    tintColor: "#BDB2B8",
  },
  iconFocused: {
    tintColor: "#fff",
  },
  scanButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#424242",
    borderRadius: 18,
    height: 70,
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 15,
  },
  scanIcon: {
    width: 36,
    height: 36,
    tintColor: "#BDB2B8",
  },
  tabBarBlur: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 100,
    height: 70,
    overflow: "hidden",
    zIndex: 5,
  },
});

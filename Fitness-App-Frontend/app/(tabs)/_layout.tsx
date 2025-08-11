import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { theme } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Import your screens
import ChatbotScreen from "./chatbot/index";
import WorkoutScreen from "./workout/index";
import NutritionScreen from "./nutrition/index";
import StatisticsScreen from "./statistics/index";
import ScanScreen from "./nutrition/screens/scan";

const BottomTabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    const load = async () => {
      await new Promise((res) => setTimeout(res, 500));
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (isWeb && isLargeScreen) {
    // Use drawer as vertical sidebar on large web screens
    return (
      <Drawer.Navigator
        screenOptions={{
          drawerType: "permanent",
          drawerStyle: styles.sidebar,
          headerShown: false,
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: "#BDB2B8",
          drawerLabelStyle: { fontSize: 14, fontWeight: "600" },
        }}
      >
        <Drawer.Screen
          name="chatbot/index"
          component={ChatbotScreen}
          options={{
            drawerLabel: "Chatbot",
            drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="workout/index"
          component={WorkoutScreen}
          options={{
            drawerLabel: "Workout",
            drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
              <MaterialCommunityIcons
                name={focused ? "dumbbell" : "dumbbell"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="nutrition/index"
          component={NutritionScreen}
          options={{
            drawerLabel: "Nutrition",
            drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
              <MaterialCommunityIcons
                name={focused ? "food-apple" : "food-apple-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="statistics/index"
          component={StatisticsScreen}
          options={{
            drawerLabel: "Stats",
            drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
              <Ionicons
                name={focused ? "pie-chart" : "pie-chart-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Drawer.Navigator>
    );
  }

  // Bottom tabs for native/small screens
  return (
    <>
      <BottomTabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: "#BDB2B8",
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: [styles.tabBarBase, styles.bottomBar, { paddingTop: 8 }],
        }}
      >
        <BottomTabs.Screen
          name="chatbot/index"
          component={ChatbotScreen}
          options={{
            tabBarLabel: "Chatbot",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={28}
                color={focused ? theme.primary : "#BDB2B8"}
              />
            ),
          }}
        />
        <BottomTabs.Screen
          name="workout/index"
          component={WorkoutScreen}
          options={{
            tabBarLabel: "Workout",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="dumbbell" // dumbbell icon doesn't have outline variant
                size={28}
                color={focused ? theme.primary : "#BDB2B8"}
              />
            ),
          }}
        />
        <BottomTabs.Screen
          name="nutrition/index"
          component={NutritionScreen}
          options={{
            tabBarLabel: "Nutrition",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name={focused ? "food-apple" : "food-apple-outline"}
                size={28}
                color={focused ? theme.primary : "#BDB2B8"}
              />
            ),
          }}
        />
        <BottomTabs.Screen
          name="statistics/index"
          component={StatisticsScreen}
          options={{
            tabBarLabel: "Stats",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "pie-chart" : "pie-chart-outline"}
                size={28}
                color={focused ? theme.primary : "#BDB2B8"}
              />
            ),
          }}
        />
      </BottomTabs.Navigator>

      {!isLargeScreen && (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("/nutrition/screens/scan")}
        >
          <Ionicons name="scan-outline" size={36} color="#fff" />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarBase: {
    backgroundColor: theme.backgroundColor,
    borderTopWidth: 0,
    elevation: 0,
  },
  bottomBar: {
    height: 70,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sidebar: {
    width: 200, // wider sidebar to fit labels
    backgroundColor: theme.backgroundColor,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    paddingTop: 20,
  },
  scanButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: theme.primary,
    borderRadius: 40,
    height: 80,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 8,
    elevation: 12,
    zIndex: 15,
  },
});

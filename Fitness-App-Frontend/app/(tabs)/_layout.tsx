import React, { useState } from "react";
import {
  View,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatbotScreen from "./chatbot/index";
import WorkoutScreen from "./workout/index";
import NutritionScreen from "./nutrition/index";
import StatisticsScreen from "./statistics/index";
import ScanScreen from "../(screens)/ScanMeal";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { TabBar } from "@/components/ui/TabBarUi/TabBar";

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1400;

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column" }}>
      <Tab.Navigator
        tabBar={(props) => <TabBar children={undefined} {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "shift",
        }}
      >
        <Tab.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ tabBarLabel: "Workout" }}
        />
        <Tab.Screen
          name="Nutrition"
          component={NutritionScreen}
          options={{ tabBarLabel: "Nutrition" }}
        />
        <Tab.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{ tabBarLabel: "Chatbot" }}
        />
        <Tab.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ tabBarLabel: "Statistics" }}
        />
      </Tab.Navigator>
    </View>
  );
}

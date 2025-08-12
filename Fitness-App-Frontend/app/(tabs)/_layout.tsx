import React, { use, useState } from "react";
import { View, useWindowDimensions, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatbotScreen from "./chatbot/index";
import WorkoutScreen from "./workout/index";
import NutritionScreen from "./nutrition/index";
import StatisticsScreen from "./statistics/index";
import ScanScreen from "./nutrition/screens/scan"; // your scan screen path
import { theme } from "@/constants/theme";

const Tab = createBottomTabNavigator();

let setWorkoutBadgeFunction: ((value: any) => void) | null = null;
let setNutritionBadgeFunction: ((value: any) => void) | null = null;

export const setWorkoutBadge = (value: any) => {
  if (setWorkoutBadgeFunction) {
    setWorkoutBadgeFunction(value);
  }
};

export const setNutritionBadge = (value: any) => {
  if (setNutritionBadgeFunction) {
    setNutritionBadgeFunction(value);
  }
};

export default function AppLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1400;
  const showLabels = width > 600;

  // Icon size for normal tabs
  const iconSize = isLargeScreen ? 28 : 30;
  const scanIconSize = 30;
  const [nutritionBadge, setNutritionBadgeState] = useState(null);
  const [workoutBadge, setWorkoutBadgeState] = useState(null);

  setWorkoutBadgeFunction = setWorkoutBadgeState;
  setNutritionBadgeFunction = setNutritionBadgeState;

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column" }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: "#888",
          tabBarVariant: isLargeScreen ? "material" : "default",
          tabBarPosition: isLargeScreen ? "left" : "bottom",
          tabBarShowLabel: showLabels,
          tabBarStyle: {
            backgroundColor: "#1C1C1C",
            borderTopWidth: 0,
            width: isLargeScreen ? 120 : undefined,
            height: isLargeScreen ? "100%" : 70,
            position: isLargeScreen ? "relative" : "absolute",
            paddingTop: isLargeScreen ? 40 : 5,
            borderRadius: isLargeScreen ? 0 : 100,
            marginHorizontal: isLargeScreen ? 0 : 10,
            marginBottom: isLargeScreen ? 0 : 20,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
          },
          tabBarLabelPosition: isLargeScreen ? "below-icon" : "beside-icon",
          tabBarLabelStyle: {
            color: "#888",
            fontSize: 14,
            marginLeft: width > 600 ? 8 : 0,
            fontWeight: "400",
          },
          animation: "shift",

          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";
            if (route.name === "Chatbot")
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            else if (route.name === "Workout")
              iconName = focused ? "barbell" : "barbell-outline";
            else if (route.name === "Nutrition")
              iconName = focused ? "restaurant" : "restaurant-outline";
            else if (route.name === "Statistics")
              iconName = focused ? "pie-chart" : "pie-chart-outline";

            return <Ionicons name={iconName} size={iconSize} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Workout" component={WorkoutScreen} options={{ tabBarLabel: "Workout", tabBarBadge: workoutBadge }} />
        <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ tabBarLabel: "Nutrition", tabBarBadge: nutritionBadge }} />

        {/* Scan Tab in the Middle with custom tabBarButton */}
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarLabel: () => null, // Hide label
            tabBarIcon: () => null,  // Hide default icon
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                style={[styles.scanButton, { bottom: -5 }]}
              >
                <Ionicons name="camera" size={scanIconSize} color="white" />
              </TouchableOpacity>
            ),
          }}
        />

        <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ tabBarLabel: "Chatbot" }}  />
        <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ tabBarLabel: "Statistics" }} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    position: "absolute",
    alignSelf: "center",
  },
});

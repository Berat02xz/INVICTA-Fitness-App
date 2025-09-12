import React from "react";
import {
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatbotScreen from "./chatbot/index";
import WorkoutScreen from "./workout/index";
import NutritionScreen from "./nutrition/index";
import ProfileScreen from "./profile/index";
import { TabBar } from "@/components/ui/TabBarUi/TabBar";

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1400;

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column" }}>
      <Tab.Navigator
        tabBar={props =>
          isLargeScreen
            ? <TabBar {...props} vertical />
            : <TabBar {...props} />
        }
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
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: "Profile" }}
        />
      </Tab.Navigator>
    </View>
  );
}

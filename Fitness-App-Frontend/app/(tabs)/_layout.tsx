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
import { theme } from "@/constants/theme";

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1400;

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column", backgroundColor: theme.backgroundColor }}>
      <Tab.Navigator
        initialRouteName="workout"
        tabBar={props =>
          isLargeScreen
            ? <TabBar {...props} vertical />
            : <TabBar {...props} />
        }
        sceneContainerStyle={{ backgroundColor: theme.backgroundColor }}
        screenOptions={{
          headerShown: false,
          animation: "shift",
        }}
      >
        <Tab.Screen
          name="workout"
          component={WorkoutScreen}
          options={{ tabBarLabel: "Workout" }}
        />
        <Tab.Screen
          name="nutrition"
          component={NutritionScreen}
          options={{ tabBarLabel: "Nutrition" }}
        />
        <Tab.Screen
          name="chatbot"
          component={ChatbotScreen}
          options={{ tabBarLabel: "Chatbot" }}
        />
        <Tab.Screen
          name="profile"
          component={ProfileScreen}
          options={{ tabBarLabel: "Profile" }}
        />
      </Tab.Navigator>
    </View>
  );
}

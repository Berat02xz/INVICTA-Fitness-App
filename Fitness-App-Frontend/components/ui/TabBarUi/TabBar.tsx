import { View, Platform, LayoutChangeEvent } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import TabBarButton from "./TabBarButton";
import { theme } from "@/constants/theme";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export const icon = {
  Workout: (props: any) => (
    <Ionicons
      name={props.focused ? "barbell" : "barbell-outline"}
      size={24}
      color={props.focused ? "#FFFFFF" : theme.textColorSecondary}
    />
  ),
  Nutrition: (props: any) => (
    <Ionicons
      name={props.focused ? "restaurant" : "restaurant-outline"}
      size={24}
      color={props.focused ? "#FFFFFF" : theme.textColorSecondary}
    />
  ),
  Chatbot: (props: any) => (
    <Ionicons
      name={props.focused ? "chatbubbles" : "chatbubbles-outline"}
      size={24}
      color={props.focused ? "#FFFFFF" : theme.textColorSecondary}
    />
  ),
  Statistics: (props: any) => (
    <Ionicons
      name={props.focused ? "pie-chart" : "pie-chart-outline"}
      size={24}
      color={props.focused ? "#FFFFFF" : theme.textColorSecondary}
    />
  ),
};

export function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarButtonProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  const [dimensions, setDimensions] = useState({ width: 100, height: 50 }); // increased height for clarity
  const buttonCount = state.routes.length;

  const buttonWidth = dimensions.width / buttonCount;
  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };
  const highlightWidth = buttonWidth * 0.8;
  const tabPositionX = useSharedValue(0);
  useEffect(() => {
    const offset = (buttonWidth - highlightWidth) - 2;
    tabPositionX.value = withSpring(buttonWidth * state.index + offset, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.index, buttonWidth]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  return (
    <View style={styles.tabBar} onLayout={onTabbarLayout}>
      <Animated.View
        style={[
          {
            position: "absolute",
            height: dimensions.height - 15,
            width: highlightWidth,
            backgroundColor: theme.primary,
            borderRadius: 35,
            top: 7,
          },
          animatedStyle,
        ]}
      />

      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 1500,
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.key}
            routeName={route.name}
            label={label}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            color={isFocused ? "#FFFFFF" : theme.textColorSecondary}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    flexDirection: "row",
    bottom: 50,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});

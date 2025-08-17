import { View, Platform, LayoutChangeEvent, StyleSheet } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
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
  const { buildHref } = useLinkBuilder();
  const [dimensions, setDimensions] = useState({ width: 100, height: 50 });
  const buttonCount = state.routes.length;
  const buttonWidth = dimensions.width / buttonCount;
  const circleSize = 70;

  const tabPositionX = useSharedValue(0);

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  useEffect(() => {
    const offset = (buttonWidth - circleSize) / 2;
    tabPositionX.value = withSpring(buttonWidth * state.index + offset, {
      damping: 15,
      stiffness: 15,
    });
  }, [state.index, buttonWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View style={styles.tabBar} onLayout={onTabbarLayout}>
      {/* Red circle highlight */}
      <Animated.View
        style={[
          {
            position: "absolute",
            height: circleSize,
            width: circleSize,
            backgroundColor: "red",
            borderRadius: circleSize / 2.3,
            top: (dimensions.height - circleSize) / 2.2,
          },
          animatedStyle,
        ]}
      />

      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const offset = (buttonWidth - circleSize) / 2;
          tabPositionX.value = withSpring(buttonWidth * index + offset, {
            damping: 15,
            stiffness: 150,
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

        return (
          <TabBarButton
            key={route.key}
            routeName={route.name}
            label={label}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
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
    bottom: 25,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    alignSelf: "center",
    paddingVertical: 15,
    
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: 330,
  },
});

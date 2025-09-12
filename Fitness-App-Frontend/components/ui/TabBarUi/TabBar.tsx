import { View, LayoutChangeEvent, StyleSheet } from "react-native";
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
import { TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";

const ACTIVE_CIRCLE = theme.primary;
const ICON_COLOR_SELECTED = "#FFFFFF";
const ICON_COLOR_UNSELECTED = "#A0A0A0";

export const icon = {
  Workout: (props: any) => (
    <Ionicons
      name={props.focused ? "barbell" : "barbell-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
  Nutrition: (props: any) => (
    <Ionicons
      name={props.focused ? "restaurant" : "restaurant-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
  Chatbot: (props: any) => (
    <Ionicons
      name={props.focused ? "chatbubbles" : "chatbubbles-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
  Profile: (props: any) => (
    <Ionicons
      name={props.focused ? "person" : "person-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
};

export function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarButtonProps) {
  const [dimensions, setDimensions] = useState({ width: 400, height: 75 });
  const buttonCount = state.routes.length;
  const buttonWidth = dimensions.width / buttonCount;
  const circleSize = 64;

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
    <View style={styles.tabBarWrapper} onLayout={onTabbarLayout}>
      <BlurView
        intensity={50}
        tint="dark"
        style={styles.tabBar}
      >
        {/* Glass effect border */}
        <View style={styles.glassBorder} pointerEvents="none" />

        {/* Colored circle highlight for active tab */}
        <Animated.View
          style={[
            styles.circle,
            {
              top: (dimensions.height - circleSize) / 2,
              backgroundColor: ACTIVE_CIRCLE,
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
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
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={{
                width: buttonWidth,
                alignItems: "center",
                justifyContent: "center",
                zIndex: isFocused ? 2 : 1,
              }}
              activeOpacity={0.7}
            >
              {icon[route.name as keyof typeof icon]?.({ focused: isFocused })}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: 333,
    height: 75,
    zIndex: 10,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(20,20,20,0.7)", // frosted dark
    paddingVertical: 14,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    width: 333,
    height: 75,
    overflow: "hidden",
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(145, 145, 145, 0.18)", // glassy white border
    zIndex: 2,
  },
  circle: {
    position: "absolute",
    zIndex: 1,
  },
});

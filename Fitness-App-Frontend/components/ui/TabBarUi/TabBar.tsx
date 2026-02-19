import { View, LayoutChangeEvent, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import TabBarButton from "./TabBarButton";
import { theme } from "@/constants/theme";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";

const ICON_COLOR_SELECTED = '#000000';       // black on lime circle
const ICON_COLOR_UNSELECTED = 'rgba(255,255,255,0.35)'; // ghosted white

export const icon = {
  workout: (props: any) => (
    <Ionicons
      name={props.focused ? "barbell" : "barbell-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
  nutrition: (props: any) => (
    <Ionicons
      name={props.focused ? "restaurant" : "restaurant-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
  chatbot: (props: any) => (
    <Ionicons
      name={props.focused ? "chatbubbles" : "chatbubbles-outline"}
      size={25}
      color={props.focused ? ICON_COLOR_SELECTED : ICON_COLOR_UNSELECTED}
    />
  ),
  profile: (props: any) => (
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
  vertical,
}: BottomTabBarProps & { vertical?: boolean }) {
  const [dimensions, setDimensions] = useState({ width: 400, height: 75 });
  const buttonCount = state.routes.length;
  const buttonWidth = dimensions.width / buttonCount;
  const circleSize = 64;

  const tabPositionX = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(0);

  const isChatbot = state.routes[state.index]?.name === "chatbot";

  // Slide tab bar off-screen when on chatbot, back when leaving
  useEffect(() => {
    tabBarTranslateY.value = withTiming(isChatbot ? 120 : 0, {
      duration: 1000,
    });
  }, [isChatbot]);

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

  const tabBarSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tabBarTranslateY.value }],
    opacity: tabBarTranslateY.value < 60 ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.tabBarWrapper, tabBarSlideStyle]} onLayout={onTabbarLayout}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        blurReductionFactor={1}
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
              backgroundColor: theme.primary,
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
    </Animated.View>
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
    // dark glass base — deepPrimary tinted so the lime circle pops
    backgroundColor: "rgba(6, 14, 6, 0.72)",
    paddingVertical: 14,
    borderRadius: 100,
    shadowColor: theme.deepPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 2,
    width: 333,
    height: 76,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",  // faint lime outline
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 1,
    // top/left highlight gives glassy depth on dark surface
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    borderLeftColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    borderRightColor: 'rgba(0, 0, 0, 0.20)',
    zIndex: 2,
  },
  circle: {
    position: "absolute",
    zIndex: 1,
  },
});

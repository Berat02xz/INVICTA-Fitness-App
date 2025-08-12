import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { icon } from "./TabBar";
import { theme } from "@/constants/theme";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";


const TabBarButton = ({
  routeName,
  label,
  isFocused,
  onPress,
  onLongPress,
  color,
}: {
  routeName: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  color: string;
}) => {

const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, {
      damping: 12,
      stiffness: 120,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.3]) },
    ],
    top: interpolate(progress.value, [0, 1],  [0, 10]),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabBarItem}
    >
      <Animated.View style={animatedIconStyle}>
        {icon[routeName]?.({
          color: isFocused ? color : theme.textColorSecondary,
          focused: isFocused,
        })}
      </Animated.View>
      <Animated.Text
        style={[
          { color: isFocused ? color : theme.textColorSecondary },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 15,
  },
});

export default TabBarButton;

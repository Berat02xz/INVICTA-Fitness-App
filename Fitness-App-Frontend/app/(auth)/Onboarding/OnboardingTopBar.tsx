import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../constants/theme";
import { useOnboarding } from "./NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";

const TopBar = () => {
  const { goBack, goForward, progressNow, totalScreens } = useOnboarding();
  const progress = useRef(new Animated.Value(progressNow())).current;
  const totalScreensCount = totalScreens();
  const currentScreen = Math.round(
    Number(progressNow()) * Number(totalScreensCount)
  );
  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressNow(),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progressNow()]);

  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrapper}>
      <FadeTranslate order={1}>
      <View style={styles.topRow}>
        <View style={styles.backIconCircle}>
          <TouchableOpacity onPress={goBack} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={25} color={theme.textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressFill, { width: animatedWidth }]}
          />
        </View>
      </View>
      </FadeTranslate>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === "web" ? 20 : 60,
    paddingHorizontal: Platform.OS === "web" ? 25 : 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  iconButton: {
    padding: 10,
  },
  backIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#f3f3f3ff",
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    flex: 1,
    height: 5,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 30,
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    backgroundColor: theme.primary,
    borderRadius: 30,
  },
});

export default TopBar;

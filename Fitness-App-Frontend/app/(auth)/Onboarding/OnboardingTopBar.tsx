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
        <TouchableOpacity onPress={goBack} style={styles.iconButton}>
          <Ionicons name="arrow-back-outline" size={25} color={theme.textColor} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressFill, { width: animatedWidth }]}
          />
        </View>

        <View style={styles.numberScreen}>
          <Text style={styles.skip}>
            {currentScreen}
            <Text style={styles.totalDimmed}> / {totalScreensCount}</Text>
          </Text>
        </View>
      </View>
      </FadeTranslate>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === "web" ? 20 : 60,
    paddingHorizontal: 15,
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
  numberScreen: {
    padding: 10,
    fontFamily: theme.bold,
  },
  skip: {
    color: theme.textColor,
    fontSize: 14,
    fontFamily: theme.semibold,
    fontWeight: "500",
  },
  totalDimmed: {
    color: theme.textColorSecondary,
    fontSize: 14,
    fontFamily: theme.light,
  },

  progressContainer: {
    flex: 1,
    height: 10,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 10,
    backgroundColor: theme.primary,
  },
});

export default TopBar;

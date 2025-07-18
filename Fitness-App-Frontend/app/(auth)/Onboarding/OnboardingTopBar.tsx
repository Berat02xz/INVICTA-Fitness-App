import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../constants/theme";
import { useOnboarding } from "./NavigationService";

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
      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack} style={styles.iconButton}>
          <Ionicons name="arrow-back-outline" size={25} color="#FFFFFF" />
        </TouchableOpacity>

        <Image
          source={require("@/assets/icons/branding/Invictus_Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.numberScreen}>
          <Text style={styles.skip}>
            {currentScreen}
            <Text style={styles.totalDimmed}> / {totalScreensCount}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressFill, { width: animatedWidth }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === "web" ? 20 : 60,
    paddingHorizontal: 15,
    backgroundColor: theme.backgroundColor,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative", 
  },

  iconButton: {
    padding: 10,
  },
  numberScreen: {
    padding: 10,
    fontFamily: theme.bold,
  },
  skip: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: theme.semibold,
    fontWeight: "500",
  },
  totalDimmed: {
    color: "#B0B0B0",
    fontSize: 14,
    fontFamily: theme.light,
  },
  logo: {
    height: 40,
    width: 95,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -47.5 }],
    zIndex: 1,
  },

  progressContainer: {
    marginTop: Platform.OS === "web" ? 20 : 25,
    height: 4,
    backgroundColor: "#383838ff",
    borderRadius: 3,
    overflow: "hidden",
    marginHorizontal: 15,
  },
  progressFill: {
    height: 6,
    backgroundColor: theme.primary,
  },
});

export default TopBar;

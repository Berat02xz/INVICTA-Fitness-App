import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../constants/theme";
import { useOnboarding } from "./NavigationService";

const TopBar = () => {
  const { goBack, goForward, progressNow } = useOnboarding();
  const progress = useRef(new Animated.Value(progressNow())).current;

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
      {/* Top Row: Back - Logo - Skip */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack} style={styles.iconButton}>
          <Ionicons name="arrow-back-outline" size={25} color="#FFFFFF" />
        </TouchableOpacity>

        <Image
          source={require("@/assets/icons/branding/Invictus_Logo.png")} 
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={goForward} style={styles.skipButton}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
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
    paddingTop: 60,
    paddingHorizontal: 15,
    backgroundColor: "#121212",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 10,
  },
  skipButton: {
    padding: 10,
  },
  skip: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: theme.regular,
    fontWeight: "500",
  },
  logo: {
    height: 25,
    width: 95,
  },
  progressContainer: {
    marginTop: 25,
    height: 4,
    backgroundColor: "#e0e0e0",
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

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "./NavigationService";
import { theme } from "../../../constants/theme";

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
    <View style={styles.container}>
      <TouchableOpacity onPress={goBack} style={styles.iconButton}>
        <Ionicons name="arrow-back-outline" size={25} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressFill, { width: animatedWidth }]}
        />
      </View>

      <TouchableOpacity onPress={goForward} style={styles.skipButton}>
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingTop: 60,
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconButton: {
    padding: 0,
  },
  skipButton: {
    padding: 0,
  },
  skip: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: theme.regular,
    fontWeight: "500",
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressFill: {
    height: 6,
    backgroundColor: theme.primary,
  },
});

export default TopBar;

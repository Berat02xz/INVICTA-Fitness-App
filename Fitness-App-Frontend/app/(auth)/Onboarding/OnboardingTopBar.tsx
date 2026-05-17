import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      <FadeTranslate order={1}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack} style={styles.iconButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressFill, { width: animatedWidth }]}
          />
        </View>
      </View>
      </FadeTranslate>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 12,
    paddingHorizontal: 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },

  iconButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontFamily: 'ExtraBold',
    fontSize: 40,
    color: '#FFFFFF',
    lineHeight: 45,
  },

  progressContainer: {
    flex: 1,
    maxWidth: 600,
    height: 10,
    backgroundColor: 'rgba(217, 217, 217, 0.2)',
    borderRadius: 8.5,
    overflow: "hidden",
  },
  progressFill: {
    height: 10,
    backgroundColor: theme.primary,
    borderRadius: 8.5,
  },
});

export default TopBar;

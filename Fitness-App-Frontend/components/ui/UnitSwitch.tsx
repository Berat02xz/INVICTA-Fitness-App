import { theme } from "@/constants/theme";
import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";


interface UnitSwitchProps {
  unit: "metric" | "imperial";
  onSelect: (unit: "metric" | "imperial") => void;
  metricLabel: string;
  imperialLabel: string;
}

const UnitSwitch: React.FC<UnitSwitchProps> = ({
  unit,
  onSelect,
  metricLabel,
  imperialLabel,
}) => {
  return (
    <View style={styles.toggleContainer}>
      <View style={[styles.sliderPill, unit === "imperial" && styles.sliderRight]} />
      
      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => {
          onSelect("metric");
        }}
      >
        <Text
          style={[styles.optionText, unit === "metric" && styles.selectedText]}
        >
          {metricLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => {
          onSelect("imperial");
        }}
      >
        <Text
          style={[styles.optionText, unit === "imperial" && styles.selectedText]}
        >
          {imperialLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: theme.deepPrimary,
    borderRadius: 20,
    alignSelf: "center",
    height: 33,
    width: 103,
    position: "relative",
    overflow: "hidden",
  },
  sliderPill: {
    position: "absolute",
    width: 50,
    height: 28,
    backgroundColor: theme.primary,
    borderRadius: 20,
    top: 3,
    left: 3,
    zIndex: 0,
  },
  sliderRight: {
    left: 50,
  },
  toggleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  optionText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: theme.bold,
  },
  selectedText: {
    fontSize: 15,
    color: "#000000",
    fontFamily: theme.bold,
  },
});

export default UnitSwitch;

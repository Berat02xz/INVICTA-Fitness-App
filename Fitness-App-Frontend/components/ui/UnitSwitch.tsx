import { theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <TouchableOpacity
        style={[
          styles.toggleOption,
          unit === "metric" && styles.selectedOption,
        ]}
        onPress={() => onSelect("metric")}
      >
        <Text
          style={[styles.optionText, unit === "metric" && styles.selectedText]}
        >
          {metricLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.toggleOption,
          unit === "imperial" && styles.selectedOption,
        ]}
        onPress={() => onSelect("imperial")}
      >
        <Text
          style={[
            styles.optionText,
            unit === "imperial" && styles.selectedText,
          ]}
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
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    alignSelf: "center",
    height: 40,
    width: 80,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: theme.primary,
  },
  optionText: {
    fontSize: 14,
    color: "black",
    fontFamily: theme.regular,
  },
  selectedText: {
    fontSize: 14,
    color: "white",
    fontFamily: theme.regular,
  },
});

export default UnitSwitch;

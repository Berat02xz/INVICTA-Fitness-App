import { theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";

const { saveSelection } = useOnboarding();

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
        onPress={() => {
          onSelect("metric");
          saveSelection("unit", "metric");
        }}
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
        onPress={() => {
          onSelect("imperial");
          saveSelection("unit", "imperial");
        }}
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
    backgroundColor: "#292929ff",
    borderRadius: 15,
    alignSelf: "center",
    height: 32,
    width: 120,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: theme.primary,
  },
  optionText: {
    fontSize: 14,
    color: "white",
    fontFamily: theme.bold,
  },
  selectedText: {
    fontSize: 14,
    color: "white",
    fontFamily: theme.bold,
  },
});

export default UnitSwitch;

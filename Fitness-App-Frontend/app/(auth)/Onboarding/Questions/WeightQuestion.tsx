import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { DrumPicker } from "@/components/ui/Onboarding/DrumPicker";

const DEFAULT_WEIGHT_METRIC = 70;
const DEFAULT_WEIGHT_IMPERIAL = 154;
const ITEM_WIDTH = 65;

// Metric: 30–200 kg, Imperial: 66–440 lbs
const METRIC_ITEMS = Array.from({ length: 171 }, (_, i) => i + 30);
const IMPERIAL_ITEMS = Array.from({ length: 375 }, (_, i) => i + 66);

const WeightQuestion = () => {
  const { goForward, answers, saveSelection } = useOnboarding();
  const [unit, setUnit] = useState<"metric" | "imperial">(
    (answers.unit as "metric" | "imperial") || "metric"
  );

  const items = unit === "metric" ? METRIC_ITEMS : IMPERIAL_ITEMS;
  const defaultVal = unit === "metric" ? DEFAULT_WEIGHT_METRIC : DEFAULT_WEIGHT_IMPERIAL;

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const saved = answers?.weight ? Number(answers.weight) : null;
    const minVal = unit === "metric" ? 30 : 66;
    if (saved && saved >= minVal) return Math.min(saved - minVal, items.length - 1);
    return defaultVal - (unit === "metric" ? 30 : 66);
  });

  const currentWeight = items[selectedIndex] ?? defaultVal;

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    // Convert current weight to new unit
    const currentVal = items[selectedIndex] ?? defaultVal;
    let converted: number;
    if (newUnit === "imperial") {
      converted = Math.round(currentVal * 2.20462);
      const newItems = IMPERIAL_ITEMS;
      const idx = Math.max(0, Math.min(converted - 66, newItems.length - 1));
      setSelectedIndex(idx);
    } else {
      converted = Math.round(currentVal / 2.20462);
      const newItems = METRIC_ITEMS;
      const idx = Math.max(0, Math.min(converted - 30, newItems.length - 1));
      setSelectedIndex(idx);
    }
    setUnit(newUnit);
  };

  const handleSubmit = () => {
    saveSelection("weight", String(currentWeight));
    saveSelection("unit", unit);
    goForward();
  };

  const renderItem = (item: number, index: number) => (
    <View
      style={[
        styles.pickerItem,
        index === selectedIndex && styles.pickerItemActive,
      ]}
    >
      <Text
        style={[
          styles.pickerText,
          index === selectedIndex && styles.pickerTextActive,
        ]}
      >
        {item}
      </Text>
    </View>
  );

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <FadeTranslate order={1}>
            <QuestionOnboarding question="What is your weight?" />
          </FadeTranslate>
          <FadeTranslate order={2}>
            <View style={styles.unitSwitchWrapper}>
              <UnitSwitch
                unit={unit}
                onSelect={handleUnitChange}
                metricLabel="KG"
                imperialLabel="LB"
              />
            </View>
          </FadeTranslate>

          <FadeTranslate order={3}>
            <Text style={styles.valueDisplay}>{currentWeight}</Text>
            <Text style={styles.unitLabel}>{unit === "metric" ? "kg" : "lbs"}</Text>
          </FadeTranslate>

          <FadeTranslate order={4}>
            <View style={styles.pickerContainer}>
              <View style={styles.centerIndicator} />
              <DrumPicker
                key={unit}
                data={items}
                renderItem={renderItem}
                itemWidth={ITEM_WIDTH}
                defaultIndex={selectedIndex}
                height={70}
                onChange={(index: number) => setSelectedIndex(index)}
              />
            </View>
          </FadeTranslate>

          <FadeTranslate order={5}>
            <View style={styles.undertextCard}>
              <UndertextCard
                emoji="⚖️"
                title="Weight"
                text="Your weight is essential for tailoring your fitness plan."
              />
            </View>
          </FadeTranslate>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  unitSwitchWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  valueDisplay: {
    fontSize: 48,
    fontFamily: theme.bold,
    color: theme.primary,
    textAlign: "center",
    marginTop: 24,
  },
  unitLabel: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  pickerContainer: {
    height: 70,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centerIndicator: {
    position: "absolute",
    width: ITEM_WIDTH,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.primary,
    backgroundColor: "rgba(170,251,5,0.08)",
    zIndex: 1,
    pointerEvents: "none",
  },
  pickerItem: {
    width: ITEM_WIDTH,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  pickerItemActive: {},
  pickerText: {
    fontSize: 20,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.3)",
  },
  pickerTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.bold,
    fontSize: 24,
  },
  undertextCard: {
    marginTop: 20,
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
});

export default WeightQuestion;

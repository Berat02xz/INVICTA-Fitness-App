import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { DrumPicker } from "@/components/ui/Onboarding/DrumPicker";

const DEFAULT_HEIGHT_METRIC = 170; // cm
const DEFAULT_HEIGHT_IMPERIAL_INCHES = 67; // 5'7"
const ITEM_WIDTH = 75;

// Metric: 100–250 cm
const METRIC_ITEMS = Array.from({ length: 151 }, (_, i) => i + 100);

// Imperial: total inches from 48 (4'0") to 84 (7'0")
const IMPERIAL_ITEMS = Array.from({ length: 37 }, (_, i) => i + 48);

const formatImperial = (totalInches: number) => {
  const ft = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${ft}'${inches}"`;
};

const HeightQuestion = () => {
  const { goForward, answers, saveSelection } = useOnboarding();
  const [unit, setUnit] = useState<"metric" | "imperial">(
    (answers.unit as "metric" | "imperial") || "metric"
  );

  const items = unit === "metric" ? METRIC_ITEMS : IMPERIAL_ITEMS;
  const minVal = unit === "metric" ? 100 : 48;
  const defaultVal = unit === "metric" ? DEFAULT_HEIGHT_METRIC : DEFAULT_HEIGHT_IMPERIAL_INCHES;

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (answers?.height) {
      if (unit === "imperial") {
        // Stored as "5'7" format or total inches
        const raw = String(answers.height);
        const match = raw.match(/^(\d+)'(\d+)/);
        if (match) {
          const total = Number(match[1]) * 12 + Number(match[2]);
          return Math.max(0, Math.min(total - minVal, items.length - 1));
        }
        const num = Number(raw);
        if (!isNaN(num)) return Math.max(0, Math.min(num - minVal, items.length - 1));
      } else {
        const num = Number(answers.height);
        if (!isNaN(num)) return Math.max(0, Math.min(num - minVal, items.length - 1));
      }
    }
    return defaultVal - minVal;
  });

  const currentValue = items[selectedIndex] ?? defaultVal;

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    const current = items[selectedIndex] ?? defaultVal;
    let converted: number;
    if (newUnit === "imperial") {
      // cm to inches
      converted = Math.round(current / 2.54);
      const newIdx = Math.max(0, Math.min(converted - 48, IMPERIAL_ITEMS.length - 1));
      setSelectedIndex(newIdx);
    } else {
      // inches to cm
      converted = Math.round(current * 2.54);
      const newIdx = Math.max(0, Math.min(converted - 100, METRIC_ITEMS.length - 1));
      setSelectedIndex(newIdx);
    }
    setUnit(newUnit);
  };

  const handleSubmit = () => {
    let heightToSave: string;
    if (unit === "imperial") {
      heightToSave = formatImperial(currentValue);
    } else {
      heightToSave = String(currentValue);
    }
    saveSelection("height", heightToSave);
    saveSelection("unit", unit);
    goForward();
  };

  const renderItem = (item: number, index: number) => {
    const label = unit === "imperial" ? formatImperial(item) : `${item}`;
    return (
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
          {label}
        </Text>
      </View>
    );
  };

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <FadeTranslate order={1}>
            <QuestionOnboarding question="What is your height?" />
          </FadeTranslate>
          <FadeTranslate order={2}>
            <View style={styles.unitSwitchWrapper}>
              <UnitSwitch
                unit={unit}
                onSelect={handleUnitChange}
                metricLabel="CM"
                imperialLabel="FT"
              />
            </View>
          </FadeTranslate>

          <FadeTranslate order={3}>
            <Text style={styles.valueDisplay}>
              {unit === "imperial" ? formatImperial(currentValue) : currentValue}
            </Text>
            <Text style={styles.unitLabel}>
              {unit === "metric" ? "cm" : "feet & inches"}
            </Text>
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
                emoji="📏"
                title="Height"
                text="Calculating your body mass index requires your height."
              />
            </View>
          </FadeTranslate>
        </View>

        <View style={styles.bottom}>
          <FadeTranslate order={6}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={handleSubmit}
            />
          </FadeTranslate>
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

export default HeightQuestion;

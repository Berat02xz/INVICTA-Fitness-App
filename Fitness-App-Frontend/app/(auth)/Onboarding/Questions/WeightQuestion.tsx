import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { DrumPicker } from "@/components/ui/Onboarding/DrumPicker";

const DEFAULT_WEIGHT_METRIC = 73; // Based on the reference image!
const DEFAULT_WEIGHT_IMPERIAL = 160;
const ITEM_WIDTH = 14; // Thinner for the strict ruler look!

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
    return defaultVal - minVal;
  });

  const currentWeight = items[selectedIndex] ?? defaultVal;

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    if (newUnit === unit) return;
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

  const renderItem = (item: number, index: number) => {
    // Every 10 units is tall, every 5 units is medium, rests are short
    // Wait, let's look at the image: there are exactly 9 short ticks between 2 tall ticks. So every 10th is a tall tick!
    const isTall = item % 10 === 0;
    const isMedium = item % 5 === 0 && !isTall;

    let height = 24;
    if (isTall) height = 48;
    else if (isMedium) height = 32;

    return (
      <View style={styles.rulerTickContainer}>
        <View style={[styles.rulerTick, { height, opacity: isTall ? 1 : (isMedium ? 0.7 : 0.4) }]} />
      </View>
    );
  };

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <FadeTranslate order={1}>
             <Text style={styles.questionTitle}>
               What is your{"\n"}current weight?
             </Text>
          </FadeTranslate>

          <FadeTranslate order={2} style={{ marginTop: 40, width: '100%', alignItems: 'center' }}>
            <View style={styles.valuePill}>
                <Text style={styles.valueDisplay}>{currentWeight},0</Text>
                <Text style={styles.unitLabel}>{unit === "metric" ? "kg." : "lb."}</Text>
            </View>
          </FadeTranslate>

          <FadeTranslate order={3} style={{ width: '100%', marginTop: 60 }}>
            <View style={styles.pickerContainer}>
              {/* Dynamic fixed center indicator matching the green line in the reference */}
              <View style={styles.centerIndicator} />
              
              <DrumPicker
                key={unit}
                data={items}
                renderItem={renderItem}
                itemWidth={ITEM_WIDTH}
                defaultIndex={selectedIndex}
                height={120}
                onChange={(index: number) => setSelectedIndex(index)}
              />
            </View>
          </FadeTranslate>
        </View>

        <View style={styles.bottom}>
          {/* Custom Unit toggle just like the image */}
          <FadeTranslate order={4} style={styles.customUnitToggle}>
            <TouchableOpacity 
               style={[styles.unitToggleBtn, unit === "metric" && styles.unitToggleBtnActive]}
               onPress={() => handleUnitChange("metric")}
               activeOpacity={0.8}
            >
               <Text style={[styles.unitToggleText, unit === "metric" && styles.unitToggleTextActive]}>kg.</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               style={[styles.unitToggleBtn, unit === "imperial" && styles.unitToggleBtnActive]}
               onPress={() => handleUnitChange("imperial")}
               activeOpacity={0.8}
            >
               <Text style={[styles.unitToggleText, unit === "imperial" && styles.unitToggleTextActive]}>lb.</Text>
            </TouchableOpacity>
          </FadeTranslate>

          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={handleSubmit}
            style={{ marginTop: 40 }}
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
  },
  content: {
    flex: 1,
    marginTop: 80,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  questionTitle: {
    fontSize: 28,
    fontFamily: theme.bold,
    color: "#FFF",
    textAlign: "center",
    lineHeight: 36,
  },
  valuePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#222222',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 40, // fully rounded pill
  },
  valueDisplay: {
    fontSize: 56,
    fontFamily: theme.bold, // Try to match the bold digital look
    color: "#FFF", // White as in reference!
    letterSpacing: -1,
  },
  unitLabel: {
    fontSize: 18,
    fontFamily: theme.medium,
    color: "#888",
    marginLeft: 8,
    marginBottom: 8, // align nicely with the baseline of big number
  },
  pickerContainer: {
    height: 120, // Increased height for taller lines
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centerIndicator: {
    position: "absolute",
    width: 3,
    height: 80, // Taller than the tallest white line
    backgroundColor: theme.primary, // #AAFB05
    zIndex: 1,
    pointerEvents: "none",
  },
  rulerTickContainer: {
    width: ITEM_WIDTH,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  rulerTick: {
    width: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  
  // Custom Toggle pill at bottom
  customUnitToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 4,
    borderRadius: 40,
    alignSelf: 'center',
  },
  unitToggleBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  unitToggleBtnActive: {
    backgroundColor: '#FFF',
  },
  unitToggleText: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: '#888',
  },
  unitToggleTextActive: {
    color: '#000',
  },
  
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 20,
  },
});

export default WeightQuestion;

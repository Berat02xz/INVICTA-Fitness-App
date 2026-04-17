import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { DrumPicker } from "@/components/ui/Onboarding/DrumPicker";

const DEFAULT_HEIGHT_METRIC = 170; // cm
const DEFAULT_HEIGHT_IMPERIAL_INCHES = 67; // 5'7"
const ITEM_WIDTH = 14;

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
    if (newUnit === unit) return;
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
    const isTall = item % 10 === 0;
    const isMedium = item % 5 === 0 && !isTall;

    let height = 24;
    if (isTall) height = 48;
    else if (isMedium) height = 32;
    
    // For Imperial inches (e.g. 5'0 is 60 inches which is mod 12 === 0)
    if (unit === "imperial") {
       const isFootTall = item % 12 === 0;
       const isHalfFootMedium = item % 6 === 0 && !isFootTall;
       height = isFootTall ? 48 : (isHalfFootMedium ? 32 : 24);
    }

    return (
      <View style={styles.rulerTickContainer}>
        <View style={[styles.rulerTick, { height, opacity: height === 48 ? 1 : (height === 32 ? 0.7 : 0.4) }]} />
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
               What is your{"\n"}current height?
             </Text>
          </FadeTranslate>

          <FadeTranslate order={2} style={{ marginTop: 40, width: '100%', alignItems: 'center' }}>
            <View style={styles.valuePill}>
                <Text style={styles.valueDisplay}>
                  {unit === "imperial" ? formatImperial(currentValue) : `${currentValue},0`}
                </Text>
                <Text style={styles.unitLabel}>{unit === "metric" ? "cm." : ""}</Text>
            </View>
          </FadeTranslate>

          <FadeTranslate order={3} style={{ width: '100%', marginTop: 60 }}>
            <View style={styles.pickerContainer}>
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
          <FadeTranslate order={4} style={styles.customUnitToggle}>
            <TouchableOpacity 
               style={[styles.unitToggleBtn, unit === "metric" && styles.unitToggleBtnActive]}
               onPress={() => handleUnitChange("metric")}
               activeOpacity={0.8}
            >
               <Text style={[styles.unitToggleText, unit === "metric" && styles.unitToggleTextActive]}>cm.</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               style={[styles.unitToggleBtn, unit === "imperial" && styles.unitToggleBtnActive]}
               onPress={() => handleUnitChange("imperial")}
               activeOpacity={0.8}
            >
               <Text style={[styles.unitToggleText, unit === "imperial" && styles.unitToggleTextActive]}>ft.</Text>
            </TouchableOpacity>
          </FadeTranslate>

          <FadeTranslate order={5}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={handleSubmit}
              style={{ marginTop: 40 }}
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
    borderRadius: 40,
  },
  valueDisplay: {
    fontSize: 56,
    fontFamily: theme.bold,
    color: "#FFF",
    letterSpacing: -1,
  },
  unitLabel: {
    fontSize: 18,
    fontFamily: theme.medium,
    color: "#888",
    marginLeft: 8,
    marginBottom: 8,
  },
  pickerContainer: {
    height: 120,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centerIndicator: {
    position: "absolute",
    width: 3,
    height: 80,
    backgroundColor: theme.primary,
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

export default HeightQuestion;

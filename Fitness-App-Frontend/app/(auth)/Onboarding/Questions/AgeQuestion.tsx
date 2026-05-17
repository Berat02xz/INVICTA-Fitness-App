import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { DrumPicker } from "@/components/ui/Onboarding/DrumPicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_AGE = "25";
const AGE_ITEMS = Array.from({ length: 83 }, (_, i) => i + 14); // 14–96
const ITEM_WIDTH = 14; // Matched with weight question

const AgeQuestion = () => {
  const { goForward, saveSelection, answers } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const saved = answers?.age ? Number(answers.age) : null;
    if (saved && saved >= 14 && saved <= 96) return saved - 14;
    return Number(DEFAULT_AGE) - 14; // default to 25
  });

  const currentAge = AGE_ITEMS[selectedIndex] ?? Number(DEFAULT_AGE);

  const handleSubmit = () => {
    saveSelection("age", String(currentAge));
    goForward();
  };

  const renderItem = (item: number, index: number) => {
    // Every 5th item is a tall tick for Age just to look cool and match styling
    const isTall = item % 5 === 0;
    const isMedium = !isTall && item % 2 === 0;

    let height = 24;
    if (isTall) height = 48;
    else if (isMedium) height = 32;

    return (
      <View style={styles.rulerTickContainer}>
        <View style={[styles.rulerTick, { height, opacity: isTall ? 1 : 0.4 }]} />
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
               What is your{"\n"}current age?
             </Text>
          </FadeTranslate>

          <FadeTranslate order={2} style={{ marginTop: 40, width: '100%', alignItems: 'center' }}>
            <View style={styles.valuePill}>
                <Text style={styles.valueDisplay}>{currentAge}</Text>
                <Text style={styles.unitLabel}>yrs.</Text>
            </View>
          </FadeTranslate>

          <FadeTranslate order={3} style={{ width: '100%', marginTop: 60 }}>
            <View style={styles.pickerContainer}>
              <View style={styles.centerIndicator} />
              
              <DrumPicker
                data={AGE_ITEMS}
                renderItem={renderItem}
                itemWidth={ITEM_WIDTH}
                defaultIndex={selectedIndex}
                height={120}
                onChange={(index: number) => setSelectedIndex(index)}
              />
            </View>
          </FadeTranslate>
        </View>

        <View style={[styles.bottom, { marginBottom: insets.bottom + 24 }]}>
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
    paddingHorizontal: 40,
    borderRadius: 40, // fully rounded pill
  },
  valueDisplay: {
    fontSize: 56,
    fontFamily: theme.bold, // Try to match the bold digital look
    color: "#FFF", 
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
  bottom: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

export default AgeQuestion;

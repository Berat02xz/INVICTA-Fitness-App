import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOnboarding } from "../NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { DrumPicker } from "@/components/ui/Onboarding/DrumPicker";

const DEFAULT_AGE = "25";
const AGE_ITEMS = Array.from({ length: 83 }, (_, i) => i + 14); // 14–96
const ITEM_WIDTH = 70;

const AgeQuestion = () => {
  const { goForward, saveSelection, answers } = useOnboarding();
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
            <QuestionOnboarding question="What is your age?" />
          </FadeTranslate>

          <FadeTranslate order={2}>
            <Text style={styles.valueDisplay}>{currentAge}</Text>
            <Text style={styles.unitLabel}>years old</Text>
          </FadeTranslate>

          <FadeTranslate order={3}>
            <View style={styles.pickerContainer}>
              <View style={styles.centerIndicator} />
              <DrumPicker
                data={AGE_ITEMS}
                renderItem={renderItem}
                itemWidth={ITEM_WIDTH}
                defaultIndex={selectedIndex}
                height={70}
                onChange={(index: number) => setSelectedIndex(index)}
              />
            </View>
          </FadeTranslate>

          <FadeTranslate order={4}>
            <View style={styles.undertextCard}>
              <UndertextCard
                emoji="☝️"
                title="Your age is important"
                titleColor={theme.textColor}
                text="Helps us make adjustments to your personal plan."
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
    alignItems: "center",
    justifyContent: "center",
  },
  valueDisplay: {
    fontSize: 48,
    fontFamily: theme.bold,
    color: theme.primary,
    textAlign: "center",
    marginTop: 30,
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
  pickerItemActive: {
    // Handled by centerIndicator overlay
  },
  pickerText: {
    fontSize: 22,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.3)",
  },
  pickerTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.bold,
    fontSize: 26,
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

export default AgeQuestion;

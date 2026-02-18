import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { theme } from "@/constants/theme";
import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import ButtonFit from "@/components/ui/ButtonFit";

export default function Pricing() {
  const { goForward } = useOnboarding();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.content}>
          <FadeTranslate order={0}>
            <QuestionOnboarding
              question="Select Model"
              undertext="Features to transform your fitness journey"
            />
          </FadeTranslate>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={goForward}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
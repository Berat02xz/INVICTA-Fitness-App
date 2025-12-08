import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const HowMuchWater = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { goForward } = useOnboarding();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const getInfoMessage = () => {
    // Low water intake
    if (selectedOption === "2 glasses") {
      return {
        title: "You drink less than 60% of users!",
        message: "Staying hydrated is key to your fitness journey. Let's work together to improve this habit.",
        color: "#ACE6FF",
      };
    }
    // Low-medium water intake
    if (selectedOption === "2-6 glasses") {
      return {
        title: "You need to hydrate more!",
        message: "You drink less than 50% of users. Let's aim to increase your water intake.",
        color: "#ACE6FF",
      };
    }
    // Medium-high water intake
    if (selectedOption === "7-10 glasses") {
      return {
        title: "You drink more than 50% of users!",
        message: "Keeping hydrated is very important for cleaning your body.",
        color: "#ACE6FF",
      };
    }
    // High water intake
    if (selectedOption === "More than 10 glasses") {
      return {
        title: "Hydration Champion!",
        message: "Amazing commitment! You're setting a great example. Let's maximize those efforts.",
        color: "#ACE6FF",
      };
    }
    return null;
  };

  const infoMessage = getInfoMessage();

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <QuestionOnboarding question="How much water do you drink daily?" />
          <View style={{ marginTop: 30 }} />
          <ButtonOnboarding
            text="2 glasses"
            rightImage={require("@/assets/icons/onboarding/droplet.png")}
            undertext="0,5l / 17oz"
            forQuestion="Water"
            onClickContinue={false}
            order={1}
            onClick={() => handleOptionSelect("2 glasses")}
          />
          <ButtonOnboarding
            text="2-6 glasses"
            rightImage={require("@/assets/icons/onboarding/drops.png")}
            undertext="0,5-1.5l / 17-50 oz"
            forQuestion="Water"
            onClickContinue={false}
            order={2}
            onClick={() => handleOptionSelect("2-6 glasses")}
          />
          <ButtonOnboarding
            text="7-10 glasses"
            rightImage={require("@/assets/icons/onboarding/ocean.png")}
            undertext="1,5-2,5l / 50-85 oz"
            forQuestion="Water"
            onClickContinue={false}
            order={3}
            onClick={() => handleOptionSelect("7-10 glasses")}
          />
          <ButtonOnboarding
            text="More than 10 glasses"
            rightImage={require("@/assets/icons/onboarding/whale.png")}
            undertext="1,5-2.5l / 50-85 oz"
            forQuestion="Water"
            onClickContinue={false}
            order={4}
            onClick={() => handleOptionSelect("More than 10 glasses")}
          />
        </View>
      </View>

      {selectedOption && infoMessage && (
        <FadeTranslate order={1} duration={1000}>
          <View style={styles.bottom}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={goForward}
              hasMoreInfo={true}
              moreInfoColor={infoMessage.color}
              moreInfoTitle={infoMessage.title}
              moreInfoImageSource={require("@/assets/icons/onboarding/water.png")}
              moreInfoText={infoMessage.message}
            />
          </View>
        </FadeTranslate>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 25,
  },
});

export default HowMuchWater;

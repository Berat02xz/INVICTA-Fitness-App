import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const iconmap = {
  pushUp1: require("@/assets/icons/onboarding/pushUp1.png"),
  pushUp2: require("@/assets/icons/onboarding/pushUp2.png"),
  pushUp3: require("@/assets/icons/onboarding/pushUp3.png"),
  Gym: require("@/assets/icons/onboarding/Gym.png"),
};

const PushUps = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { goForward } = useOnboarding();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const getInfoMessage = () => {
    // Beginner
    if (selectedOption === "Beginner") {
      return {
        title: "Dont Worry!",
        message: "Every rep counts. We'll build your strength step by step. You've got this!",
        color: "#FFACAC",
      };
    }
    // Intermediate
    if (selectedOption === "Intermediate") {
      return {
        title: "Good Foundation!",
        message: "Let's push your limits and reach new milestones.",
        color: "#FFACAC",
      };
    }
    // Advanced
    if (selectedOption === "Advanced") {
      return {
        title: "Good Foundation!",
        message: "Keep building on this momentum for peak performance.",
        color: "#D0FFAC",
      };
    }
    // Gym Enthusiast
    if (selectedOption === "Gym Enthusiast") {
      return {
        title: "Great Foundation!",
        message: "Let's take you to the next level.",
        color: "#D0FFAC",
      };
    }
    return null;
  };

  const infoMessage = getInfoMessage();
  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{ zIndex: 1 }}>
            <QuestionOnboarding question="How many pushups can you do?" />
            <View style={{ marginTop: 30 }} />
            <ButtonOnboarding
              text="Beginner"
              undertext="Less than 10 push-ups"
              emoji="🥀"
              forQuestion="PushUps"
              onClickContinue={false}
              order={0}
              onClick={() => handleOptionSelect("Beginner")}
            />
            <ButtonOnboarding
              text="Intermediate"
              undertext="10 to 20 push-ups"
              emoji="😤"
              forQuestion="PushUps"
              onClickContinue={false}
              order={1}
              onClick={() => handleOptionSelect("Intermediate")}
            />
            <ButtonOnboarding
              text="Advanced"
              undertext="21 to 30 push-ups"
              emoji="🚀"
              forQuestion="PushUps"
              onClickContinue={false}
              order={2}
              onClick={() => handleOptionSelect("Advanced")}
            />
            <ButtonOnboarding
              text="Gym Enthusiast"
              undertext="More than 30 push-ups"
              emoji="💪"
              forQuestion="PushUps"
              onClickContinue={false}
              order={3}
              onClick={() => handleOptionSelect("Gym Enthusiast")}
            />
          </View>
        </View>
      </View>

      {selectedOption && infoMessage && (
        <FadeTranslate order={5} duration={1000}>
          <View style={styles.bottom}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={goForward}
              hasMoreInfo={true}
              moreInfoColor={infoMessage.color}
              moreInfoTitle={infoMessage.title}
              moreInfoIcon="dumbbell"
              moreInfoText={infoMessage.message}
            />
          </View>
        </FadeTranslate>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 25,
  },
});

export default PushUps;

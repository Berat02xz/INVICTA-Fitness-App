import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";
("use client");

const LastTimeHappyBodyImage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { goForward } = useOnboarding();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const getInfoMessage = () => {
    // Low confidence options
    if (selectedOption === "1-2 years ago" || selectedOption === ">3 years ago" || selectedOption === "Never") {
      return {
        title: "You've Got This!",
        message: "Every step counts. We're here to help you feel confident again!",
        color: "#FFE0B2",
      };
    }
    // High confidence option
    if (selectedOption === "<1 year ago") {
      return {
        title: "Great Foundation!",
        message: "Keep building on this momentum. We'll help you reach your goals!",
        color: "#C8E6C9",
      };
    }
    return null;
  };

  const infoMessage = getInfoMessage();
  return (
    <>
      <SolidBackground style={styles.background} />

      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <QuestionOnboarding question="Last time you felt confident in your body?" />
          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            text="<1 year ago"
            emoji="🤔"
            onClickContinue={false}
            forQuestion="last_time_happy_body_image"
            order={0}
            onClick={() => handleOptionSelect("<1 year ago")}
          />
          <ButtonOnboarding
            text="1-2 years ago"
            emoji="😅"
            onClickContinue={false}
            forQuestion="last_time_happy_body_image"
            order={1}
            onClick={() => handleOptionSelect("1-2 years ago")}
          />
          <ButtonOnboarding
            text=">3 years ago"
            emoji="🙁"
            onClickContinue={false}
            forQuestion="last_time_happy_body_image"
            order={2}
            onClick={() => handleOptionSelect(">3 years ago")}
          />
          <ButtonOnboarding
            text="Never"
            emoji="✖️"
            onClickContinue={false}
            forQuestion="last_time_happy_body_image"
            order={3}
            onClick={() => handleOptionSelect("Never")}
          />
        </View>
      </View>

      {selectedOption && infoMessage && (
        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={goForward}
            hasMoreInfo={true}
            moreInfoColor={infoMessage.color}
            moreInfoTitle={infoMessage.title}
            moreInfoIcon="heart"
            moreInfoText={infoMessage.message}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    zIndex: 1,
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 25,
  },
});

export default LastTimeHappyBodyImage;

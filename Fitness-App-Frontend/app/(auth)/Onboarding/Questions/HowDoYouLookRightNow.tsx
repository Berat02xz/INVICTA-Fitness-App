import ButtonOnboarding from "@/components/ui/Onboarding/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";
("use client");

const bodyImages = {
  male: {
    Average: require("@/assets/icons/onboarding/Average2.png"),
    Heavy: require("@/assets/icons/onboarding/Heavy.png"),
    Skinny: require("@/assets/icons/onboarding/Skinny.png"),
  },
  female: {
    Average: require("@/assets/icons/onboarding/F_Average.png"),
    Heavy: require("@/assets/icons/onboarding/F_Heavy.png"),
    Skinny: require("@/assets/icons/onboarding/F_Skinny.png"),
  },
};

const HowDoYouLookRightNow = () => {
  const { answers } = useOnboarding();
  console.log("🔍 HowDoYouLookRightNow - All answers:", answers);
  const gender = ((answers.gender as string) || "male").toLowerCase();
  console.log("👤 Gender detected:", gender);
  const images = bodyImages[gender as keyof typeof bodyImages] || bodyImages.male;
  console.log("🖼️ Using images for gender:", gender, "|", images);

  return (
    <>
      <SolidBackground />
      <View style={styles.container}>
        <View style={styles.content}>
          <QuestionOnboarding question="Choose your body type" />
          <View style={{ marginTop: 30 }} />

          <ButtonOnboarding
            height={150}
            text="Average"
            onClickContinue
            forQuestion="look_perception"
            BodyImage={images.Average}
            order={0}
          />
          <ButtonOnboarding
            height={150}
            text="Heavy"
            onClickContinue
            forQuestion="look_perception"
            BodyImage={images.Heavy}
            order={1}
          />
          <ButtonOnboarding
            height={150}
            text="Slim"
            onClickContinue
            forQuestion="look_perception"
            BodyImage={images.Skinny}
            order={2}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default HowDoYouLookRightNow;

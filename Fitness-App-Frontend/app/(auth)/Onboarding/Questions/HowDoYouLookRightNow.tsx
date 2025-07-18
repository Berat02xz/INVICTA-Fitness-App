import ButtonOnboarding from '@/components/ui/AnswerOnboarding';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';
import SolidBackground from '@/components/ui/SolidBackground';
import React from 'react';
import { StyleSheet, View } from 'react-native';
"use client";

const bodyImage = {
  Average: require("@/assets/icons/onboarding/Average2.png"),
  Heavy: require("@/assets/icons/onboarding/Heavy.png"),
  Skinny: require("@/assets/icons/onboarding/Skinny.png"),
};

const HowDoYouLookRightNow = () => {
  return (
    <View style={styles.container}>
      <SolidBackground />

      <View style={styles.content}>
        <QuestionOnboarding question="Choose your body type" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          height={150}
          text="Average"
          onClick={() => {
            console.log("Average selected");
          }}
          onClickContinue
          forQuestion="look_perception"
          BodyImage={bodyImage.Average}
          order={0}
        />
        <ButtonOnboarding
          height={150}
          text="Heavy"
          onClick={() => {
            console.log("Heavy selected");
          }}
          onClickContinue
          forQuestion="look_perception"
          BodyImage={bodyImage.Heavy}
          order={1}
        />
        <ButtonOnboarding
          height={150}
          text="Slim"
          onClick={() => {
            console.log("Slim selected");
          }}
          onClickContinue
          forQuestion="look_perception"
          BodyImage={bodyImage.Skinny}
          order={2}
        />
      </View>
    </View>
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

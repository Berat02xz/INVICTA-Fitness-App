import React from 'react';
import { View, Text } from 'react-native';
import ButtonOnboarding from '@/components/ui/ButtonOnboarding';
"use client";
import GradientBackground from '@/components/ui/GradientBackground';
import { StyleSheet } from 'react-native';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';

const bodyImage = {
  Average: require("@/assets/icons/onboarding/Average.png"),
  Heavy: require("@/assets/icons/onboarding/Heavy.png"),
  Skinny: require("@/assets/icons/onboarding/Skinny.png"),
};

const HowDoYouLookRightNow = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>

        <QuestionOnboarding
          question="How do you think you look right now?"
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={150}
          text="Average"
          onClick={() => {
            console.log("Average selected");
          }}
          oneAnswer
          forQuestion="look_perception"
          BodyImage={bodyImage.Average}
        />
        <ButtonOnboarding
          height={150}
          text="Heavy"
          onClick={() => {
            console.log("Heavy selected");
          }}
          oneAnswer
          forQuestion="look_perception"
          BodyImage={bodyImage.Heavy}
        />
        <ButtonOnboarding
          height={150}
          text="Skinny"
          onClick={() => {
            console.log("Skinny selected");
          }}
          oneAnswer
          forQuestion="look_perception"
          BodyImage={bodyImage.Skinny}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
  },
});

export default HowDoYouLookRightNow;
import React from 'react';
import { View, Text } from 'react-native';
import ButtonOnboarding from '@/components/ui/ButtonOnboarding';
"use client";
import GradientBackground from '@/components/ui/GradientBackground';
import { StyleSheet } from 'react-native';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';

const bodyImage = {
  Slim: require("@/assets/icons/onboarding/Skinny.png"),
  Cut: require("@/assets/icons/onboarding/Cut.png"),
  Bulk: require("@/assets/icons/onboarding/Bulk.png"),
};

const HowDoYouWantToLookLike = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>

        <QuestionOnboarding
          question="How do you want to look like?"
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={150}
          text="Slim"
          onClick={() => {
            console.log("Slim selected");
          }}
          oneAnswer
          forQuestion="look_goal"
          BodyImage={bodyImage.Slim}
        />
        <ButtonOnboarding
          height={150}
          text="Cut"
          onClick={() => {
            console.log("Cut selected");
          }}
          oneAnswer
          forQuestion="look_goal"
          BodyImage={bodyImage.Cut}
        />
        <ButtonOnboarding
          height={150}
          text="Bulk"
          onClick={() => {
            console.log("Bulk selected");
          }}
          oneAnswer
          forQuestion="look_goal"
          BodyImage={bodyImage.Bulk}
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

export default HowDoYouWantToLookLike;
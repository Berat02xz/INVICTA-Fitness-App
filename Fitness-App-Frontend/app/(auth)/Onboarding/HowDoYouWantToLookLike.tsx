import ButtonOnboarding from '@/components/ui/ButtonOnboarding';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';
import SolidBackground from '@/components/ui/SolidBackground';
import React from 'react';
import { StyleSheet, View } from 'react-native';
"use client";

const bodyImage = {
  Slim: require("@/assets/icons/onboarding/Skinny.png"),
  Cut: require("@/assets/icons/onboarding/Cut.png"),
  Bulk: require("@/assets/icons/onboarding/Bulk.png"),
};

const HowDoYouWantToLookLike = () => {
  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="Choose your body goal" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          height={150}
          text="Slim"
          onClick={() => console.log("Slim selected")}
          oneAnswer
          forQuestion="look_goal"
          BodyImage={bodyImage.Slim}
        />
        <ButtonOnboarding
          height={150}
          text="Cut"
          onClick={() => console.log("Cut selected")}
          oneAnswer
          forQuestion="look_goal"
          BodyImage={bodyImage.Cut}
        />
        <ButtonOnboarding
          height={150}
          text="Bulk"
          onClick={() => console.log("Bulk selected")}
          oneAnswer
          forQuestion="look_goal"
          BodyImage={bodyImage.Bulk}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative', // Important for absolute background
  },
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default HowDoYouWantToLookLike;

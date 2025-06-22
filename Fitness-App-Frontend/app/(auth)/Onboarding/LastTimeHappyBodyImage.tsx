import React from 'react';
import { View, Text } from 'react-native';
import ButtonOnboarding from '@/components/ui/ButtonOnboarding';
"use client";
import GradientBackground from '@/components/ui/GradientBackground';
import { StyleSheet } from 'react-native';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';

const activity_level = {
  no_level: require('@/assets/icons/onboarding/activity_level_00000.png'),
  slightly_active: require('@/assets/icons/onboarding/activity_level_00001.png'),
  moderately_active: require('@/assets/icons/onboarding/activity_level_00002.png'),
  very_active: require('@/assets/icons/onboarding/activity_level_00003.png'),
};

const LastTimeHappyBodyImage = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>

        <QuestionOnboarding
          question="When was the last time you were happy with your body image?"
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={57}
          text="Less than a year ago 😕"
          onClick={() => {
            console.log("Less than a year ago selected");
          }}
          oneAnswer
          forQuestion="last_time_happy_body_image"
        />
        <ButtonOnboarding
          height={57}
          text="1 or 2 years ago 😟"
          onClick={() => {
            console.log("1 or 2 years ago selected");
          }}
          oneAnswer
          forQuestion="last_time_happy_body_image"
        />
        <ButtonOnboarding
          height={57}
          text="More than 3 years ago 🙁"
          onClick={() => {
            console.log("More than 3 years ago selected");
          }}
          oneAnswer
          forQuestion="last_time_happy_body_image"
        />
        <ButtonOnboarding
          height={57}
          text="Never 😞"
          onClick={() => {
            console.log("Never selected");
          }}
          oneAnswer
          forQuestion="last_time_happy_body_image"
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

export default LastTimeHappyBodyImage;
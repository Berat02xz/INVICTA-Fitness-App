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

const ActivityLevel = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>

        <QuestionOnboarding
          question="What is your activity level?"
          undertext='This helps us design your workouts to fit your lifestyle'
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={57}
          text="Sedentary"
          undertext='I do almost no exercise'
          imageSrc={activity_level.no_level}
          onClick={() => {
            console.log("Sedentary selected");
          }}
          oneAnswer
          forQuestion="activity_level"

/>
        <ButtonOnboarding
          height={57}
          text="Slightly Active"
          undertext='I exercise up to 2 hours in a week'
          imageSrc={activity_level.slightly_active}
          onClick={() => {
            console.log("Slightly Active selected");
          }}
          oneAnswer
          forQuestion="activity_level"
        />
        <ButtonOnboarding
          height={57}
          text="Moderately Active"
          undertext='I exercise up to 4 hours in a week'
          imageSrc={activity_level.moderately_active}
          onClick={() => {
            console.log("Moderately Active selected");
          }}
          oneAnswer
          forQuestion="activity_level"
        />
        <ButtonOnboarding
          height={57}
          text="Very Active"
          undertext='I exercise for 4+ hours in a week'
          imageSrc={activity_level.very_active}
          onClick={() => {
            console.log("Very Active selected");
          }}
          oneAnswer
          forQuestion="activity_level"
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

export default ActivityLevel;
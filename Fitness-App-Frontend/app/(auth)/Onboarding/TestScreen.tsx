import React from 'react';
import { View, Text } from 'react-native';
import ButtonOnboarding from '@/components/ui/ButtonOnboarding';
"use client";
import GradientBackground from '@/components/ui/GradientBackground';
import { StyleSheet } from 'react-native';

const HowDoYouLookRightNow = () => {
    return (
        <View style={styles.container}>
      <GradientBackground position="top" />

      <View style={{ zIndex: 1 }}>
        <ButtonOnboarding
          height={57}
          text="Test your fitness level"
          onClick={() => {
            console.log("Weight Loss selected");
          }}
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Test your body composition"
          onClick={() => {
            console.log("Weight Gain selected");
          }}
          oneAnswer
        />
        <ButtonOnboarding
          height={57}
          text="Test your strength level"
          onClick={() => {
            console.log("Build Strength selected");
          }}
          oneAnswer
        />

        <ButtonOnboarding
          height={57}
          text="Test"
          onClick={() => {
            console.log("Improve Health selected");
          }}
          oneAnswer
        />
      </View>
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#032ff0",
    flex: 1,
    padding: 24,
  },
});

export default HowDoYouLookRightNow;
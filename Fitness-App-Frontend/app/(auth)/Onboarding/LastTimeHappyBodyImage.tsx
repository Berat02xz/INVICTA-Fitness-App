import ButtonOnboarding from '@/components/ui/ButtonOnboarding';
import QuestionOnboarding from '@/components/ui/QuestionOnboarding';
import SolidBackground from '@/components/ui/SolidBackground';
import React from 'react';
import { StyleSheet, View } from 'react-native';
"use client";

const LastTimeHappyBodyImage = () => {
  return (
    <View style={styles.outerContainer}>
      <SolidBackground style={styles.background} />

      <View style={styles.innerContainer}>
        <QuestionOnboarding
          question="Last time you felt confident in your body?"
        />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="<1 year ago"
          emoji='🤔'
          onClick={() => console.log("Less than a year ago selected")}
          oneAnswer
          forQuestion="last_time_happy_body_image"
          order={0}
        />
        <ButtonOnboarding
          text="1-2 years ago"
          emoji='😅'
          onClick={() => console.log("1-2 years ago selected")}
          oneAnswer
          forQuestion="last_time_happy_body_image"
          order={1}
        />
        <ButtonOnboarding
                    text=">3 years ago"
          emoji='🙁'
          onClick={() => console.log("More than 3 years ago selected")}
          oneAnswer
          forQuestion="last_time_happy_body_image"
          order={2}
        />
        <ButtonOnboarding
                    text="Never"
                    emoji='✖️'
          onClick={() => console.log("Never selected")}
          oneAnswer
          forQuestion="last_time_happy_body_image"
          order={3}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative', 
  },
  background: {
    ...StyleSheet.absoluteFillObject, 
    zIndex: 0,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    zIndex: 1, 
    alignItems: "center",
  },
});

export default LastTimeHappyBodyImage;

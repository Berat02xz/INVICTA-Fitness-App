import React from "react";
import { View, Text } from "react-native";
import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
("use client");
import GradientBackground from "@/components/ui/GradientBackground";
import { StyleSheet } from "react-native";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";


const AdditionalChallenge = () => {
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={{ zIndex: 1 }}>
        <QuestionOnboarding
          question="In addition to your goal, what challenge would you like to join?"
        />
        <View style={{ marginTop: 30 }}></View>

        <ButtonOnboarding
          height={57}
          text="Walk It!"
          undertext="Walk 10K steps for 7 days in a row."
          onClick={() => {
            console.log("Walk It! selected");
          }}
          oneAnswer
          forQuestion="challenge"
        />
        <ButtonOnboarding
          height={57}
          text="0 Alcohol Intake"
          undertext="Cut out alcohol from your body."
          onClick={() => {
            console.log("0 Alcohol Intake selected");
          }}
          oneAnswer
          forQuestion="challenge"
        />
        <ButtonOnboarding
          height={57}
          text="21 days no sugar"
          undertext="cut out all the refined sugar for 21 days."
          onClick={() => {
            console.log("21 days no sugar selected");
          }}
          oneAnswer
          forQuestion="challenge"
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

export default AdditionalChallenge;

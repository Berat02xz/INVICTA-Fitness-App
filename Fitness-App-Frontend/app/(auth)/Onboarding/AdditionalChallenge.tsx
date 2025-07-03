import ButtonOnboarding from "@/components/ui/ButtonOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";

const AdditionalChallenge = () => {
  return (
    <View style={styles.outerContainer}>
      {/* Background covers entire screen */}
      <SolidBackground style={StyleSheet.absoluteFill} />

      {/* Content with padding */}
      <View style={styles.container}>
        <QuestionOnboarding question="Pick an extra challenge to join:" 
        undertext="No worries, you can edit this later." />

        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
          text="Walk It!"
          undertext="Walk 10K steps for 7 days in a row."
          onClick={() => {
            console.log("Walk It! selected");
          }}
          oneAnswer
          forQuestion="challenge"
        />
        <ButtonOnboarding
          text="0 Alcohol Intake"
          undertext="Cut out alcohol from your body."
          onClick={() => {
            console.log("0 Alcohol Intake selected");
          }}
          oneAnswer
          forQuestion="challenge"
        />
        <ButtonOnboarding
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
  outerContainer: {
    flex: 1,
    position: "relative", // needed for absoluteFill positioning
  },
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default AdditionalChallenge;

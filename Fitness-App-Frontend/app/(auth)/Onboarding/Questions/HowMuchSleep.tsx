import ButtonOnboarding from "@/components/ui/AnswerOnboarding";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useOnboarding } from "../NavigationService";

const HowMuchSleep = () => {
  const { goForward } = useOnboarding();

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <QuestionOnboarding question="How much sleep do you get?" />
        <View style={{ marginTop: 30 }} />

        <ButtonOnboarding
                    text="Less than 6 hours"
          emoji='😴'
          onClick={() => {
            console.log("Less than 6 hours selected");
          }}
          forQuestion="Sleep"
          onClickContinue
          order={0}
        />
        <ButtonOnboarding
                    text="Between 6 and 8 hours"
          emoji='😌'
          onClick={() => {
            console.log("Between 6 and 8 hours selected");
          }}
          forQuestion="Sleep"
          onClickContinue
          order={1}
        />
        <ButtonOnboarding
                    text="Over 8 hours"
                    emoji='💤'
          onClick={() => {
            console.log("Over 8 hours selected");
          }}
          forQuestion="Sleep"
          onClickContinue
          order={2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 25,
    zIndex: 1,
    alignItems: "center",
  },
});

export default HowMuchSleep;

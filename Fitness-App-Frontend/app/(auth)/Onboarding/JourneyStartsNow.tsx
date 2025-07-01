import {
  useOnboarding,
  UserAnswers,
} from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import GradientBackground from "@/components/ui/GradientBackground";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function JourneyStartsNow() {
  const { goForward } = useOnboarding();
  const answerMap = Object.fromEntries(
    UserAnswers.map((item) => [item.question, item.answer])
  );

const animation = useRef(new Animated.Value(0)).current;
  const [animatedDateString, setAnimatedDateString] = useState("");
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3);
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
const id = animation.addListener(({ value }) => {
      const animatedDate = new Date(
        startDate.getTime() + value * (endDate.getTime() - startDate.getTime())
      );
      const formatted = animatedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      setAnimatedDateString(formatted);
    });

    return () => animation.removeListener(id);
  }, []);

  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString());
  //set the target date to 3 months from now
    useEffect(() => {
        const target = new Date();
        target.setMonth(target.getMonth() + 3);
        setTargetDate(target.toISOString().split("T")[0]);
    }, []);

useEffect(() => {
  if (targetDate) {
    const exists = UserAnswers.find(entry => entry.question === "target date");
    if (!exists) {
      UserAnswers.push({ question: "target date", answer: targetDate });
      console.log("User answers submitted:", UserAnswers);
    }
  }
}, [targetDate]);


  const unit = answerMap["unit"] || "metric";
  const targetWeight = unit === "metric" ? answerMap["target weight"] + " kg" : answerMap["target weight"] + " lb" || "70 kg";
    
  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />

      <View style={styles.main}>
        <View style={styles.middle}>
          <Text style={[styles.sloganBold, { color: "white" }]}>
            Your journey starts now.
          </Text>

          <Text style={styles.sloganRegular}>
            With our plan, you’ll crush your goal of {targetWeight} 🎉 by
          </Text>

            <Text style={[styles.sloganBold, { marginTop: 30, color: theme.primary }]}>
                {animatedDateString}
            </Text>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={() => {
              goForward();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  main: {
    flex: 1,
    paddingTop: 250,
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
  },
  middle: {
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    gap: 10,
  },
  Logo: {
    fontSize: 48,
    fontFamily: theme.black,
    color: theme.textColor,
    marginBottom: 20,
  },
  sloganBold: {
    fontSize: 21,
    fontFamily: theme.bold,
    color: theme.primary,
    width:300,
    textAlign:'center'
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 10,
    width: "60%",
  },
  infoText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
});

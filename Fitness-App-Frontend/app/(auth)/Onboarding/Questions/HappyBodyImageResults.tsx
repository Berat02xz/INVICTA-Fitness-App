import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import FadeTranslate from "@/components/ui/FadeTranslate";
import RadialBlurBackground from "@/components/ui/RadialBlurBackground";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function HappyBodyImageResults() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { goForward } = useOnboarding();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 37,
      duration: 7000,
      useNativeDriver: false,
      easing: Easing.out(Easing.poly(15)),
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setPercentage(Math.floor(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  return (<>
  <SolidBackground /> 
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.main}>
          <View style={styles.middle}>
            <FadeTranslate order={1}>
            <Text style={styles.sloganBold}>{percentage}% of users</Text>
            </FadeTranslate>
            <FadeTranslate order={2}>
            <View style={styles.undertextCard}>
              <UndertextCard
                emoji="🤗"
                title="Responded the same way"
                titleColor="white"
                text="You are not alone in your feelings about your body image."
              />
            </View>
            </FadeTranslate>
          </View>
        </View>
        <FadeTranslate order={3}>
        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={() => {
              goForward();
            }}
          />
        </View>
        </FadeTranslate>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: "center",
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  undertextCard: {
    marginTop: 10,
  },
  middle: {
    alignItems: "center",
    width: "100%",
    // Remove height: "100%" — not needed
    justifyContent: "center",
  },

  bottom: {
    alignItems: "center",
    marginBottom: 50,
  },

  sloganBold: {
    fontSize: 30,
    fontFamily: theme.bold,
    color: theme.primary,
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 10,
    width: "65%",
  },
});

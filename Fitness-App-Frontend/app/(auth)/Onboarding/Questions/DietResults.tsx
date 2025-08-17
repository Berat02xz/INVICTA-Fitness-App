import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import UndertextCard from "@/components/ui/UndertextCard";
import { theme } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function DietResults() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);
  const { goForward } = useOnboarding();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 65,
      duration: 7000,
      easing: Easing.out(Easing.poly(15)),
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setPercentage(Math.floor(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <View style={styles.middle}>
            <Text style={styles.sloganBold}>
              {percentage}% of your results are about nutrition
            </Text>
            <View style={styles.undertextCard}>
              <UndertextCard
                emoji="🥗"
                title="Dietary Guidance"
                titleColor="white"
                text="We provide you with personalized recommendations."
              />
            </View>
          </View>

          <View style={styles.bottom}>
            <ButtonFit
              title="Continue"
              backgroundColor={theme.primary}
              onPress={() => goForward()}
            />
          </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 1,
  },
  undertextCard: {
    marginTop: 10,
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    marginBottom: 10,
  },

  sloganBold: {
    fontSize: 25,
    fontFamily: theme.bold,
    color: theme.primary,
    textAlign: "center",
    width: 320,
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: "#D9D9D9",
    textAlign: "center",
    marginTop: 10,
    width: "65%",
  },
  infoText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
});

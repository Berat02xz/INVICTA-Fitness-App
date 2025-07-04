import ButtonFit from "@/components/ui/ButtonFit";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/icons/onboarding/FirstScreenBGK2.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.main}>
        <View style={styles.top}>
          <Image
            source={require("@/assets/icons/branding/Invictus_Logo.png")}
            style={styles.Logo}
            resizeMode="contain"
          />

          <Text style={[styles.sloganBold, { marginTop: 10 }]}>
            One decision
          </Text>
          <Text style={styles.sloganRegular}>That's all it takes.</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <ButtonFit
          title="Sign Up: Start The Quiz"
          backgroundColor={theme.primary}
          onPress={() => {
            router.push("/(auth)/Onboarding/FitnessGoal");
          }}
        />
        <ButtonFit
          title="Log In: I’ve done the quiz"
          backgroundColor={theme.buttonsolid}
          hasBorder
          onPress={() => {
            router.push("/login");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    position: "relative",
  },

  main: {
    flex: 1,
    paddingTop: 90,
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
    marginBottom: 100,
    flex: 1,
    justifyContent: "flex-end",
  },
  Logo: {
    fontSize: 48,
    fontFamily: theme.black,
    color: theme.textColor,
    height: 85,
    marginBottom: 10,
  },
  sloganBold: {
    fontSize: 25,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  sloganRegular: {
    fontSize: 25,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  infoText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  imageContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    width: "100%",

  },

  backgroundImage: {
    height: 700,
    resizeMode: "contain",
    width: "100%",
  },
});

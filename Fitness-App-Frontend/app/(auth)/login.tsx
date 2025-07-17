import { setToken } from "@/api/axiosInstance";
import { Login } from "@/api/UserData";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export const LoginScreen = () => {
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    try {
      const response = await Login({ email: Email, password: Password });
      if (!response || !response.token) {
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: "Login failed.",
        });
        return;
      } else {
        setToken(response.token);
        router.push("../../../(app)/Home");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const msg =
        error?.response?.data && typeof error.response.data === "string"
          ? error.response.data
          : "An unexpected error occurred. Please try again.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg,
      });
    }
  }

  return (
    <>
      <View style={styles.container}>
        <SolidBackground style={StyleSheet.absoluteFill} />
        <View style={styles.content}>
          <Image
            source={require("@/assets/icons/branding/Invictus_Logo_weight3.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headingContainer}>
            <Text style={[styles.heading, styles.headingBold]}>
              One decision.
            </Text>
            <Text style={styles.heading}>That’s all it takes.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.buttonBorder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={Email}
                onChangeText={setEmail}
              />{" "}
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
                placeholder="Pass"
                placeholderTextColor={theme.buttonBorder}
                autoCapitalize="none"
                autoComplete="password"
                value={Password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={theme.textColor}
                  style={{ marginRight: 10 }}
                />
              </Pressable>
            </View>

            <ButtonFit
              title="Log In: I’ve done the quiz"
              backgroundColor={theme.primary}
              onPress={handleSubmit}
            />

            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.line} />
            </View>

            <ButtonFit
              title="Sign Up: Start the quiz"
              backgroundColor="#331111"
              style={{ borderColor: theme.primary, borderWidth: 1 }}
              onPress={() =>
                router.push("../../../(auth)/Onboarding/FitnessGoal")
              }
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headingContainer: {
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    alignItems: "center",
    alignSelf: "center",
  },
  logoImage: {
    width: 120,
    height: 60,
    marginBottom: 25,
  },
  heading: {
    fontSize: 30,
    fontFamily: theme.regular,
    textAlign: "center",
    color: theme.textColor,
  },
  headingBold: {
    fontFamily: theme.bold,
  },
  formContainer: {
    marginTop: 30,
    width: "100%",
    gap: 18,
    alignSelf: "center",
  },
  input: {
    height: 62,
    backgroundColor: theme.buttonsolid,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
    alignSelf: "center",
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.buttonsolid,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: theme.bold,
    fontSize: 15,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#999",
  },
  separatorText: {
    marginHorizontal: 10,
    color: "#999",
    fontFamily: theme.medium,
  },
});

export default LoginScreen;

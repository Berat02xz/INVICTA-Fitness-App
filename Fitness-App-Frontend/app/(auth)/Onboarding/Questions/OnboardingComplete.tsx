import { setToken } from "@/api/axiosInstance";
import { getUserIdFromToken } from "@/api/tokenDecoder";
import { registerUser, uploadOnboardingData } from "@/api/UserData";
import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useOnboarding, UserAnswers } from "../NavigationService";

const OnboardingComplete = () => {
  const { goForward } = useOnboarding();

  const [Name, setName] = useState<string>("");
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");

  async function handleSubmit() {
    try {
      const response = await registerUser({ Name, Email, Password });

      if (!response || !response.token) {
        Toast.show({
          type: "error",
          text1: "Registration Error",
          text2: "Registration failed.",
        });
        return;
      } else {
       setToken(response.token);
      }

      const userId = await getUserIdFromToken();
      if (!userId) {
        Toast.show({
          type: "error",
          text1: "Token Error",
          text2: "Could not extract user ID from token.",
        });
        return;
      }

      const uploadResponse = await uploadOnboardingData({
        userId,
        answers: UserAnswers,
      });
      
      if (!uploadResponse) {
        Toast.show({
          type: "error",
          text1: "Upload Error",
          text2: "Failed to upload onboarding data.",
        });
        return;
      }

      // Proceed to the next step if any in the future
      goForward();
      // Proceed to home screen of (app)
      router.push("../../../(app)/Home");
    } catch (error: any) {
      console.error("Submission error:", error);
      const msg =
        error?.response?.data && typeof error.response.data === "string"
          ? error.response.data
          : "Server error. Please try again later.";
      Toast.show({
        type: "error",
        text1: "Submission Error",
        text2: msg,
      });
    }
  }

  return (
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <QuestionOnboarding question="Almost done!" />
        </View>

        <View style={{ marginTop: 10, flexGrow: 1, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "flex-start",
              flexGrow: 1,
            }}
          >
            <Text style={styles.infoText}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              placeholder="Name"
              autoComplete="name"
              placeholderTextColor={theme.buttonBorder}
              value={Name}
              onChangeText={setName}
            />

            <Text style={styles.infoText}>Your Email</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={theme.buttonBorder}
                autoComplete="email"
                value={Email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.infoText}>Enter A Password</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={styles.input}
                keyboardType="default"
                secureTextEntry={true}
                placeholder="***********"
                autoComplete="password"
                placeholderTextColor={theme.buttonBorder}
                value={Password}
                onChangeText={setPassword}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <ButtonFit
          title="Continue"
          backgroundColor={theme.primary}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: 25,
  },
  bottom: {
    alignItems: "center",
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: theme.textColor,
    textAlign: "left",
    marginTop: 20,
  },
  input: {
    fontSize: 16,
    padding: 3,
    width: 330,
    borderBottomWidth: 1,
    borderBottomColor: theme.buttonBorder,
    textAlign: "left",
    color: theme.textColor,
    fontFamily: theme.regular,
    marginTop: 5,
  },
});

export default OnboardingComplete;

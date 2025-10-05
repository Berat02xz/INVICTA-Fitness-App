import { setToken } from "@/api/AxiosInstance";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import {
  FetchUserInformationAndStore,
  RegisterUser,
  UploadUserInformation,
  DeleteUser,
} from "@/api/UserDataEndpoint";
import ButtonFit from "@/components/ui/ButtonFit";
import QuestionOnboarding from "@/components/ui/Onboarding/QuestionOnboarding";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TextInput, View, Animated } from "react-native";
import Toast from "react-native-toast-message";
import { useOnboarding } from "../NavigationService";
import database from "@/database/database";
import { User } from "@/models/User";
import FadeTranslate from "@/components/ui/FadeTranslate";

const OnboardingComplete = () => {
  const { goForward } = useOnboarding();

  const [Name, setName] = useState<string>("");
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [Role, setRole] = useState<string>("FREE");

  const [isLoading, setIsLoading] = useState(false);
  const { answers, saveSelection } = useOnboarding();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Rotation animation
  useEffect(() => {
    if (isLoading) {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoading]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        saveSelection("gender", "male");
        saveSelection("app_name", "Invicta");
        console.log("Saving gender and app_name to answers");
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    };
    initializeUser();
  }, []);

  async function handleSubmit() {
    if (isLoading) return; // Prevent multiple submissions
    
    let userId: string | null = null;
    setIsLoading(true);

    try {
      // Step 1: Register
      const response = await RegisterUser({ Name, Email, Password, Role });
      if (!response?.token) {
        throw new Error("Registration failed.");
      }
      setToken(response.token);

      userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error("Could not extract user ID from token.");
      }

      // Step 2: Upload onboarding data
      const uploadResponse = await UploadUserInformation({ userId, answers });
      if (!uploadResponse) {
        throw new Error("Failed to upload onboarding data.");
      }

      // Success → move forward
      goForward();
      router.push("/(tabs)/workout");
    } catch (error) {
      console.error("Submission error:", error);
      if (userId) {
        await DeleteUser(userId); // Backend must have this endpoint
        console.log("User deleted due to submission error.");
      }

      Toast.show({
        type: "error",
        text1: "Submission Error",
        text2:
          error instanceof Error
            ? error.message
            : "Server error. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <FadeTranslate order={1}>
              <QuestionOnboarding question="Almost done!" />
            </FadeTranslate>
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
              <FadeTranslate order={2}>
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
              </FadeTranslate>
              <FadeTranslate order={3}>
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
              </FadeTranslate>
              <FadeTranslate order={4}>
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
              </FadeTranslate>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <FadeTranslate order={5} duration={1000}>
          <ButtonFit
            title="Register"
            backgroundColor={theme.primary}
            onPress={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating account..."
          />
          </FadeTranslate>
        </View>
      </View>
    </>
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

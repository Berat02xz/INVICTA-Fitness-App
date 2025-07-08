import { setToken } from "@/api/axiosInstance";
import { Login } from "@/api/UserData";
import ButtonFit from "@/components/ui/ButtonFit";
import SolidBackground from "@/components/ui/SolidBackground";
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
    <View style={styles.container}>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <Text style={styles.Logo}>INVICTUS</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Your Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={theme.buttonBorder}
            autoCapitalize="none"
            autoComplete="email"
            value={Email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Enter Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPassword}
              placeholder="********"
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
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Log In"
            backgroundColor={theme.primary}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  formContainer: {
    marginTop: 40,
    width: 330,
    alignSelf: "center",
    gap: 18,
  },
  label: {
    fontSize: 15,
    fontFamily: theme.medium,
    color: theme.textColor,
    marginBottom: 5,
  },
  input: {
    height: 48,
    backgroundColor: theme.buttonsolid,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.buttonsolid,
    borderRadius: 10,
  },
  bottom: {
    marginTop: 60,
    alignItems: "center",
  },
    Logo: {
    fontSize: 48,
    fontFamily: theme.black,
    color: theme.textColor,
    height: 85,
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default LoginScreen;

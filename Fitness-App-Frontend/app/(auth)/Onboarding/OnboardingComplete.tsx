import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import GradientBackground from "@/components/ui/GradientBackground";
import QuestionOnboarding from "@/components/ui/QuestionOnboarding";
import ButtonFit from "@/components/ui/ButtonFit";
import { useOnboarding } from "./NavigationService";
import { theme } from "@/constants/theme";
import { UserAnswers } from "./NavigationService";

const OnboardingComplete = () => {
  const { goForward } = useOnboarding();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function handleSubmit() {
    UserAnswers.push({ question: "name", answer: name });
    UserAnswers.push({ question: "email", answer: email });
    UserAnswers.push({ question: "password", answer: password });
    console.log("User completed onboarding");
  }

  return (
    <View style={styles.container}>
      <GradientBackground position="bottom" />
      <View style={styles.main}>
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <QuestionOnboarding 
            question="Your personalized workout plan is ready!"
          />
        </View>
        <View style={{ marginTop: 10, flexGrow: 1, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "left",
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
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.infoText}>Your Email</Text>

            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "left" }}
            >
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={theme.buttonBorder}
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <Text style={styles.infoText}>Enter A Password</Text>
            <View
              style={{ flexDirection: "row", gap: 10, justifyContent: "left" }}
            >
              <TextInput
                style={styles.input}
                keyboardType="default"
                secureTextEntry={true}
                placeholder="***********"
                autoComplete="password"
                placeholderTextColor={theme.buttonBorder}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <ButtonFit
            title="Continue"
            backgroundColor={theme.primary}
            onPress={() => {
              handleSubmit();
              goForward();
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    padding: 25,
  },
  main: {
    flex: 1,
  },
  bottom: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: theme.textColor,
    textAlign: "left",
    marginTop: 20,
  },
  input: {
    height: 45,
    borderColor: theme.buttonBorder,
    backgroundColor: theme.buttonsolid,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColor,
    width: 300,
  },
});

export default OnboardingComplete;

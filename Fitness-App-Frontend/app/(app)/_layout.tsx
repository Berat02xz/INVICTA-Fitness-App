import { loadToken } from "@/api/axiosInstance";
import { getUserIdFromToken } from "@/api/tokenDecoder";
import { fetchOnboardingDataAndStore } from "@/api/UserData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<
    { question: string; answer: string }[]
  >([]);

  useEffect(() => {
  const initializeOnboarding = async () => {
    try {
      await loadToken(); // Ensure token is loaded before any API calls
      const storedData = await AsyncStorage.getItem("Onboarding");
      if (storedData) {
        console.log("[Onboarding] Found in AsyncStorage.");
        const parsedData = JSON.parse(storedData);
        setOnboardingData(parsedData);
      } else {
        console.log("[Onboarding] Not found in AsyncStorage. Fetching from API...");
        const userId = await getUserIdFromToken();
        if (userId) {
          await fetchOnboardingDataAndStore(userId);
          console.log("[Onboarding] Fetched and stored for user:", userId);

          const newData = await AsyncStorage.getItem("Onboarding");
          if (newData) {
            const parsed = JSON.parse(newData);
            setOnboardingData(parsed);
          } else {
            console.warn("[Onboarding] Failed to save to AsyncStorage after fetch.");
          }
        } else {
          console.warn("[Onboarding] User ID is null. Cannot fetch.");
        }
      }
    } catch (error) {
      console.error("Error in initializeOnboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  initializeOnboarding();
}, []);


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {onboardingData.map(({ question, answer }, index) => (
        <View key={index} style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: "bold" }}>{question}</Text>
          <Text>{answer}</Text>
        </View>
      ))}
      <Slot />
    </View>
  );
};

export default App;

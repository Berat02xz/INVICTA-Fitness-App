import { getUserIdFromToken } from "@/api/tokenDecoder";
import { fetchOnboardingDataAndStore } from "@/api/UserData";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
        const userId = await getUserIdFromToken();
        await fetchOnboardingDataAndStore(userId || "");
        const storedData = await AsyncStorage.getItem("Onboarding");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setOnboardingData(parsedData);
        } else {
          console.warn("No onboarding data found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Error fetching onboarding data:", error);
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
    </View>
  );
};

export default App;

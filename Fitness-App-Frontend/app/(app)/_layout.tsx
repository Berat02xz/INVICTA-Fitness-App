import { getUserIdFromToken } from "@/api/tokenDecoder";
import { FetchOnboardingDataAndStore } from "@/api/UserData";
import database from "@/database/database";
import { OnboardingModel } from "@/models/User";
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
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.warn("[Onboarding] User ID is null. Cannot fetch.");
          setIsLoading(false);
          return;
        }

        // Query WatermelonDB for existing onboarding answers
        const collection = database.get<OnboardingModel>("onboarding_answers");
        let storedData = await collection.query().fetch();

        if (storedData.length === 0) {
          // No local data, fetch from API and store
          await FetchOnboardingDataAndStore(userId);

          // Re-fetch from DB after storing
          storedData = await collection.query().fetch();
        }

        // Map to simple object array for rendering
        const simplified = storedData.map(item => ({
          question: item.question,
          answer: item.answer,
        }));

        setOnboardingData(simplified);
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

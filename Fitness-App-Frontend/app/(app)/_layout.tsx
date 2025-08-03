import { getUserIdFromToken } from "@/api/tokenDecoder";
import { FetchUserInformationAndStore } from "@/api/UserData";
import database from "@/database/database";
import { User } from "@/models/User";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.warn("[User] User ID is null. Cannot fetch.");
          setIsLoading(false);
          return;
        }

        // Try to get user from DB
        let user = await User.getUserDetails(database);

        if (!user) {
          // Fetch from API and store locally
          try {
            await FetchUserInformationAndStore(userId);
          } catch (error) {
            console.error("Error fetching user information from BE:", error);
          }
          try {
            user = await User.getUserDetails(database);
          } catch (error) {
            console.error("Error fetching user from WatermelonDB:", error);
          }
        }

        setUserData(user);
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    console.warn("[User] No user data found.");
    return (
      <View>
        <Text>WatermelonDB is not available. Please Log in</Text>
      </View>
    );
  }

  return (
    <View>
      {/* JUST FOR TESTING PURPOSES */}
      <Text>User ID: {userData.userId}</Text>
      <Text>Name: {userData.name}</Text>
      <Text>Email: {userData.email}</Text>
      <Text>Age: {userData.age}</Text>
      <Text>Gender: {userData.gender}</Text>
      <Text>Height: {userData.height}</Text>
      <Text>Weight: {userData.weight}</Text>
      <Text>Activity Level: {userData.activityLevel}</Text>
      <Text>Fitness Level: {userData.fitnessLevel}</Text>
      <Text>Goal: {userData.goal}</Text>
      <Text>Unit: {userData.unit}</Text>
      <Text>App Name: {userData.appName}</Text>
      <Text>Caloric Deficit: {userData.caloricDeficit}</Text>
      <Text>BMI: {userData.bmi}</Text>
      <Text>BMR: {userData.bmr}</Text>
      <Text>TDEE: {userData.tdee}</Text>
      <Text>Caloric Intake: {userData.caloricIntake}</Text>
      <Text>Equipment Access: {userData.equipmentAccess}</Text>





      <Slot />
    </View>
  );
};

export default App;

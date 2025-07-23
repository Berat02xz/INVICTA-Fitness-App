import { getNameFromToken } from "@/api/tokenDecoder";
import { LogoutUser } from "@/api/UserData";
import { theme } from "@/constants/theme";
import { Button } from "@react-navigation/elements";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const Home = () => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserName = async () => {
      const name = await getNameFromToken();
      setUserName(name || "User");
    };
    fetchUserName();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hello, {userName} 👋</Text>
      <Button onPress={() => {
        LogoutUser();
        console.log("User logged out");
      }}>LOG OUT</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: theme.bold,
  },
});

export default Home;

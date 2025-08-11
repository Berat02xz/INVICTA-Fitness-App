import { Button } from "@react-navigation/elements";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LogoutUser } from "@/api/UserDataEndpoint";
export default function Workout() {


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Workout Screen!</Text>
      <TouchableOpacity onPress={() => LogoutUser()}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

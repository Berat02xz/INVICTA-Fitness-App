import { router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Nutrition() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Nutrition Screen!</Text>
      <TouchableOpacity onPress={() => {router.push("../(screens)/ScanMeal")}}>
        <Text>Scan Meal</Text>
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

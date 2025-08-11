import SolidBackground from "@/components/ui/SolidBackground";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Statistics() {
  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <Text style={styles.text}>Statistics Feature Coming Soon!</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

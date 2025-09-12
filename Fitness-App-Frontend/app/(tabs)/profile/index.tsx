import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";

export default function Profile() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1542785291-fe3faea39066?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGlnaHR8ZW58MHx8MHx8fDA%3D",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.text}>Profile Feature Coming Soon!</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
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

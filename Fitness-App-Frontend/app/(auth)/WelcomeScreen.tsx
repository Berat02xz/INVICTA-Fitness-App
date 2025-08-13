import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const images = [
  require("@/assets/icons/onboarding/Welcome1.png"),
  require("@/assets/icons/onboarding/Welcome1.png"),
  require("@/assets/icons/onboarding/Welcome1.png"),
  require("@/assets/icons/onboarding/Welcome1.png"),
  require("@/assets/icons/onboarding/Welcome1.png"),
];

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / width);
      setActiveIndex(index);
    },
  });

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    }, 1500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      {/* Full-screen gradient */}  
      <LinearGradient
        colors={[theme.deepPrimary, "#ff0000ff"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top 2/3 images */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ height: height * 0.66 }}
      >
        {images.map((img, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={img}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </Animated.ScrollView>

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Level up</Text>
        <Text style={styles.subtitle}>
          Stay consistent, rise through levels, and see real results
        </Text>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? theme.primary : "#666" },
                i === activeIndex && { width: 20 },
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            router.push("../../../(auth)/Onboarding/Questions/FitnessGoal")
          }
        >
          <Text style={styles.startButtonText}>Let's start</Text>
        </TouchableOpacity>

        {/* Link to login */}
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginText}>You already have an account?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  imageWrapper: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: height * 0.66,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: theme.backgroundColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 70,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontFamily: theme.bold,
    color: "white",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#ccc",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15,
    fontFamily: theme.regular,
    width: 200,
    lineHeight: 15,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 30,
    marginTop: 25,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    marginBottom: 15,
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.bold,
  },
  loginText: {
    color: "#ccc",
    fontSize: 14,
    fontFamily: theme.medium,
    textDecorationLine: "underline",
  },
});

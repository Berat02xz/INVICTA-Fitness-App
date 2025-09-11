import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { theme } from "@/constants/theme"; // Ensure theme is defined or provide fallback
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';

// Use Dimensions for responsive layout
const { width, height } = Dimensions.get("window");

// Import images for both mobile and web
// Replace these with actual image assets in your project
// Example: Place images in src/assets/icons/onboarding/
import Welcome1 from "@/assets/icons/onboarding/Welcome1.png"; // Replace with actual image
import Welcome2 from "@/assets/icons/onboarding/Welcome1.png"; // Replace with actual image
import Welcome3 from "@/assets/icons/onboarding/Welcome1.png"; // Replace with actual image
import Welcome4 from "@/assets/icons/onboarding/Welcome1.png"; // Replace with actual image

const images = [Welcome1, Welcome2, Welcome3, Welcome4];

// Fallback image URL in case imports fail
const FALLBACK_IMAGE = 'https://via.placeholder.com/375x200?text=Fallback+Image';

const titles = ['Body', 'Metabolism', 'Mind', 'Progress'];

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / width);
      runOnJS(setActiveIndex)(index);
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      runOnJS(setActiveIndex)(nextIndex);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const goPrev = () => {
    const prevIndex = (activeIndex - 1 + images.length) % images.length;
    scrollRef.current?.scrollTo({ x: prevIndex * width, animated: true });
    setActiveIndex(prevIndex);
  };

  const goNext = () => {
    const nextIndex = (activeIndex + 1) % images.length;
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setActiveIndex(nextIndex);
  };

  return (
    <View style={styles.container}>
      {/* Title and Controls */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleStatic}>Master Your</Text>
        <View style={styles.dynamicContainer}>
          {titles.map((title, index) => {
            const animatedStyle = useAnimatedStyle(() => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0, 1, 0],
                Extrapolation.CLAMP
              );
              return { opacity };
            });
            return (
              <Animated.Text
                key={index}
                style={[styles.titleDynamic, animatedStyle]}
              >
                {title}
              </Animated.Text>
            );
          })}
        </View>
        {/* Controls: Arrows and Dots */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={goPrev} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={32} color="white" />
          </TouchableOpacity>
          <View style={styles.dotsContainer}>
            {images.map((_, i) => {
              const animatedStyle = useAnimatedStyle(() => ({
                backgroundColor: i === activeIndex ? theme.primary : 'rgba(255, 255, 255, 0.5)',
                width: withTiming(i === activeIndex ? 20 : 8),
                transform: [{ scale: withTiming(i === activeIndex ? 1.2 : 1) }],
              }));
              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, animatedStyle]}
                />
              );
            })}
          </View>
          <TouchableOpacity onPress={goNext} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={styles.carousel}
          snapToInterval={width}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
        >
          {images.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={img}
                style={styles.image}
                resizeMode="contain"
                defaultSource={{ uri: FALLBACK_IMAGE }}
                onError={(e) => console.log(`Image ${index} load error:`, e.nativeEvent.error)}
                onLoad={() => console.log(`Image ${index} loaded successfully`)}
              />
            </View>
          ))}
        </Animated.ScrollView>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            router.push("../../../(auth)/Onboarding/Questions/FitnessGoal")
          }
        >
          <Text style={styles.startButtonText}>Let's start</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginText}>You already have an account?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme?.backgroundColor || '#1a1a1a',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 20,
  },
  titleStatic: {
    fontSize: 32,
    fontFamily: theme?.bold || 'Arial',
    color: 'white',
    textAlign: 'center',
  },
  dynamicContainer: {
    position: 'relative',
    width: 200,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  titleDynamic: {
    fontSize: 32,
    fontFamily: theme?.bold || 'Arial',
    color: 'white',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    position: 'absolute',
    top: 0,
    width: '100%',
    textAlign: 'center',
    ...Platform.select({
      web: {
        transitionProperty: 'opacity',
        transitionDuration: '200ms',
        transitionTimingFunction: 'ease-in-out',
      },
    }),
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '60%',
  },
  arrowButton: {
    padding: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '200ms',
        transitionTimingFunction: 'ease-in-out',
      },
    }),
  },
  carouselContainer: {
    position: 'relative',
    height: height * 0.5,
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backgroundColor: 'transparent', // Add contrast to verify image visibility
      },
    }),
  },
  carousel: {
    height: height * 0.5,
    width,
  },
  carouselContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: height * 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: 200,
    ...Platform.select({
      web: {
        objectFit: 'contain', // Ensure web images scale correctly
      },
    }),
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: width - 32,
    padding: 20,
    paddingBottom: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: theme?.primary || '#3b82f6',
    width: 333,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: theme?.bold || 'Arial',
  },
  loginText: {
    color: 'white',
    fontSize: 14,
    fontFamily: theme?.medium || 'Arial',
    textDecorationLine: 'underline',
  },
});
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Platform, Animated, Text, Easing, TextInput } from "react-native";
import ReviewCard from "@/components/ui/Onboarding/ReviewCard";
import SolidBackground from "@/components/ui/SolidBackground";
import ButtonFit from "@/components/ui/ButtonFit";
import { theme } from "@/constants/theme";
import { useOnboarding } from "@/app/(auth)/Onboarding/NavigationService";
import FadeTranslate from "@/components/ui/FadeTranslate";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(TextInput);

const reviews = [
  {
    name: "Matt Young",
    username: "matty",
    avatar: require("@/assets/avatars/avatar6.jpg"),
    rating: 5,
    comment:
      "Kinda crazy how accurate the results prediction are. I put my details 3 months ago and it was almost exact.",
  },
  {
    name: "Clayton Marsh",
    username: "clay",
    avatar: require("@/assets/avatars/avatar4.jpg"),
    rating: 4,
    comment:
      "Didn't expect much but the app makes it super easy to track meals and make workouts a habit. My posture looks way better",
  },
  {
    name: "DanFit",
    username: "danfit",
    avatar: require("@/assets/avatars/avatar7.jpg"),
    rating: 5,
    comment:
      "This app makes staying fit easy and effective for all levels. No gym or equipment needed.",
  },
  {
    name: "Theo",
    username: "theo",
    avatar: require("@/assets/avatars/avatar3.jpg"),
    rating: 4,
    comment: "Downloaded for the workouts, stayed for the meal tracking.",
  },
];

export default function Reviews() {
  const { goForward } = useOnboarding();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showButton, setShowButton] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Circle config
  const size = 280;
  const strokeWidth = 15;
  const radius = 80; // Match previous implementation radius
  const circumference = 2 * Math.PI * radius;

  // Animate progress to 100% over 10 seconds
  useEffect(() => {
    // Listener for text update
    const listenerId = progressAnim.addListener(({ value }) => {
      const percentage = Math.round(value * 100);
      if (textInputRef.current) {
        textInputRef.current.setNativeProps({
          text: `${percentage}%`,
        });
      }
    });

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: false, // SVG props require JS driver with standard Animated
    }).start(({ finished }) => {
      if (finished) {
        setShowButton(true);
      }
    });

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  // Auto-change reviews every 3 seconds with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change review
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <>
      <SolidBackground />
      <View style={styles.outerContainer}>
        <View style={styles.content}>
          {/* Header Text */}
          <FadeTranslate order={0}>
            <Text style={styles.headerText}>
              Generating your personalized plan
            </Text>
          </FadeTranslate>

          {/* Circular Progress */}
          <FadeTranslate order={1}>
            <View style={styles.circleContainer}>
              <View style={styles.progressChartWrapper}>
                <Svg width={size} height={size}>
                  <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {/* Background Circle */}
                    <Circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#E0E0E0"
                      strokeWidth={8} // Thinner background track as per original design? Original had 8
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={theme.primary}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </G>
                </Svg>
              </View>
              {/* Use TextInput for high performance updates without re-renders */}
              <AnimatedText
                ref={textInputRef}
                style={styles.percentageText}
                editable={false}
                defaultValue="0%"
              />
            </View>
          </FadeTranslate>

          {/* Reviews Display */}
          <FadeTranslate order={3}>
            <View style={styles.reviewsContainer}>
              <Animated.View style={[styles.reviewWrapper, { opacity: fadeAnim }]}>
                <ReviewCard {...reviews[currentReviewIndex]} />
              </Animated.View>
            </View>
          </FadeTranslate>
        </View>

        <View style={styles.bottom}>
          {showButton && (
            <FadeTranslate order={0} duration={500} animated={true}>
              <ButtonFit
                title="Continue"
                backgroundColor={theme.primary}
                onPress={goForward}
              />
            </FadeTranslate>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  headerText: {
    fontSize: 35,
    fontFamily: theme.semibold,
    color: theme.primary,
    textAlign: "center",
    maxWidth: 300,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 280,
    width: 280,
  },
  progressChartWrapper: {
    position: "absolute",
  },
  progressChart: {
    marginHorizontal: 0,
    borderRadius: 16,
  },
  percentageText: {
    position: "absolute",
    fontSize: 38,
    fontFamily: theme.bold,
    color: theme.textColor,
    textAlign: 'center',
    width: '100%',
    padding: 0,
  },
  subtextText: {
    fontSize: 20,
    fontFamily: theme.semibold,
    color: theme.primary,
    marginBottom: 25,
  },
  reviewsContainer: {
    width: "100%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

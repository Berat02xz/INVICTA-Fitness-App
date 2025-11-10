import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { theme } from "@/constants/theme";

// Progress Chart Configuration
const PROGRESS_CHART = {
  SIZE: 80,
  STROKE_WIDTH: 15,
  RADIUS: 30,
};

interface CalorieProgressChartProps {
  calories: number;
  targetCalories: number;
}

export default function CalorieProgressChart({ calories, targetCalories }: CalorieProgressChartProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const progress = Math.min(calories / targetCalories, 1);

    // Reset to 0 first
    setAnimatedProgress(0);

    // Small delay to ensure reset is rendered before animation starts
    const startDelay = setTimeout(() => {
      // Animate from 0 to target value
      let frame = 0;
      const totalFrames = 60; // 60 frames for smooth animation
      
      const animationInterval = setInterval(() => {
        frame++;
        const currentProgress = frame / totalFrames;
        
        setAnimatedProgress(progress * currentProgress);
        
        if (frame >= totalFrames) {
          clearInterval(animationInterval);
          // Ensure final value is exact
          setAnimatedProgress(progress);
        }
      }, 16); // ~60fps

      return () => clearInterval(animationInterval);
    }, 50); // 50ms delay to ensure reset is visible

    return () => clearTimeout(startDelay);
  }, [calories, targetCalories]);

  return (
    <View style={styles.container}>
      <ProgressChart
        data={{
          labels: ["Calories"],
          data: [animatedProgress]
        }}
        width={PROGRESS_CHART.SIZE}
        height={PROGRESS_CHART.SIZE}
        strokeWidth={PROGRESS_CHART.STROKE_WIDTH}
        radius={PROGRESS_CHART.RADIUS}
        chartConfig={{
          backgroundGradientFrom: "rgba(0, 0, 0, 0)",
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: "rgba(0, 0, 0, 0)",
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => theme.primary, // theme.primary
          strokeWidth: PROGRESS_CHART.STROKE_WIDTH,
          propsForBackgroundLines: {
            strokeWidth: 0
          }
        }}
        hideLegend={true}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  chart: {
    paddingRight: 0,
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
});

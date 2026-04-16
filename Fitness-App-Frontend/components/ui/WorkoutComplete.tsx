import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { D } from "../../app/(screens)/WorkoutPlayer"; // Or use your own theme/D objects
import { theme } from "../../constants/theme";
import FadeTranslate from "./FadeTranslate";

interface WorkoutCompleteProps {
  routineName: string;
  duration: string;
  calories: number;
  exercises: number;
  onFinish: () => void;
}

type FeelType = "Hard" | "Just right" | "Easy";

export default function WorkoutComplete({
  routineName,
  duration,
  calories,
  exercises,
  onFinish,
}: WorkoutCompleteProps) {
  const insets = useSafeAreaInsets();
  const [selectedFeel, setSelectedFeel] = useState<FeelType | null>(null);

  const feelOptions: FeelType[] = ["Hard", "Just right", "Easy"];

  return (
    <FadeTranslate order={0} translateYFrom={30} style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout{"\n"}completed!</Text>
        <Text style={styles.subtitle}>{routineName}</Text>
      </View>

      <View style={styles.checkmarkContainer}>
        <View style={styles.checkmarkRing}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={60} color="#000" />
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statColumn}>
          <View style={styles.statIconContainer}>
            <Ionicons name="play" size={16} color="#000" style={{ marginLeft: 2 }} />
          </View>
          <View>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{duration}</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame" size={16} color="#000" />
          </View>
          <View>
            <Text style={styles.statLabel}>Burns</Text>
            <Text style={styles.statValue}>{Math.floor(calories)} kcal</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <View style={styles.statIconContainer}>
            <Ionicons name="barbell" size={16} color="#000" />
          </View>
          <View>
            <Text style={styles.statLabel}>Exercises</Text>
            <Text style={styles.statValue}>{exercises}</Text>
          </View>
        </View>
      </View>

      <View style={styles.feelSection}>
        <Text style={styles.feelTitle}>How do you feel?</Text>
        <View style={styles.feelOptionsRow}>
          {feelOptions.map((option) => {
            const isSelected = selectedFeel === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.feelOption,
                  isSelected && styles.feelOptionSelected,
                ]}
                onPress={() => setSelectedFeel(option)}
              >
                <Text style={styles.feelOptionText}>{option}</Text>
                {isSelected && (
                  <View style={styles.feelCheckmark}>
                    <Ionicons name="checkmark" size={12} color="#000" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Pressable onPress={onFinish} style={styles.finishButton}>
        <Text style={styles.finishButtonText}>Finish</Text>
      </Pressable>
    </FadeTranslate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E', // Matching the dark background
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontFamily: theme.black, // Using the heaviest font or bold
    fontSize: 40,
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 12,
  },
  subtitle: {
    color: '#fff',
    fontFamily: theme.medium,
    fontSize: 18,
    textAlign: 'center',
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  checkmarkRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(170, 251, 5, 0.15)', // Darker lime green ring
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#AAFB05', // Lime green
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    backgroundColor: '#252528',
    borderRadius: 30,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
  },
  statColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: theme.medium,
    fontSize: 12,
  },
  statValue: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  feelSection: {
    alignItems: 'center',
    width: '100%',
  },
  feelTitle: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 22,
    marginBottom: 24,
  },
  feelOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  feelOption: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#252528',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  feelOptionSelected: {
    borderColor: '#AAFB05',
    backgroundColor: '#1C1C1E',
  },
  feelOptionText: {
    color: '#fff',
    fontFamily: theme.medium,
    fontSize: 14,
  },
  feelCheckmark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#AAFB05',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  finishButton: {
    width: '100%',
    backgroundColor: '#AAFB05',
    paddingVertical: 18,
    borderRadius: 999, // Fully rounded
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#000',
    fontFamily: theme.black, // Make it bold
    fontSize: 18,
  }
});
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { ROUTINES } from "@/constants/workoutRoutines";
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width: SCREEN_W } = Dimensions.get("window");

const D = {
  bg: "#000000",
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.15)",
  text: "#FFFFFF",
  sub: "#999999",
  muted: "#333333",
  card: "#121212",
  cardAlt: "#1C1C1E",
};

export default function RoutineDetail() {
  const insets = useSafeAreaInsets();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const routine = ROUTINES.find((r) => r.id === routineId);

  if (!routine) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: D.text, fontFamily: theme.medium }}>Routine not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: D.primary, fontFamily: theme.bold }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStartRoutine = () => {
    router.replace({
      pathname: "/(screens)/WorkoutPlayer",
      params: { routineId: routine.id },
    });
  };

  const handleExercisePress = (ex: any) => {
    router.push({
      pathname: "/(screens)/ExerciseDetail",
      params: {
        exerciseId: ex.exerciseId,
        name: ex.name,
        sets: ex.sets?.toString(),
        reps: ex.reps?.toString(),
        restSeconds: ex.restSeconds?.toString(),
        category: ex.category,
        gifUrl: ex.gifUrl || "",
      },
    });
  };

  return (
    <View style={s.container}>
      {/* Absolute Back btn */}
      <TouchableOpacity
        style={[s.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={24} color={D.text} />
      </TouchableOpacity>

      {/* Fixed Background Header */}
      <View style={[s.heroWrap, { position: "absolute", top: 0, left: 0, right: 0 }]}>
        <LinearGradient
          colors={routine.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroGradient}
        />
        <Text style={s.heroEmoji}>{routine.emoji}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Transparent Spacer to push the bottom sheet down */}
        <View style={{ height: SCREEN_W * 0.85 }} />

        {/* Content Wrapper */}
        <View style={s.contentWrapper}>
          <View style={s.contentHandle} />

          <FadeTranslate order={0}>
          {/* Top minimal stats */}
          <View style={s.topStatsRow}>
            <View style={s.topStatItem}>
              <Ionicons name="time-outline" size={16} color={D.sub} />
              <Text style={s.topStatText}>{routine.duration}</Text>
            </View>
            <View style={s.topStatDot} />
            <View style={s.topStatItem}>
              <Ionicons name="barbell-outline" size={16} color={D.sub} />
              <Text style={s.topStatText}>{routine.exercises.length} Exercises</Text>
            </View>
            <View style={s.topStatDot} />
            <View style={s.topStatItem}>
              <Ionicons name="flame-outline" size={16} color={D.sub} />
              <Text style={s.topStatText}>{routine.difficulty}</Text>
            </View>
          </View>

          <Text style={s.title}>{routine.name}</Text>
          <Text style={s.description}>{routine.description}</Text>

          {/* Tags */}
          <View style={s.tagsRow}>
            {routine.targetMuscles.map((m) => (
              <View key={m} style={s.muscleBadge}>
                <Text style={s.muscleBadgeText}>{m}</Text>
              </View>
            ))}
            {routine.equipment.map((eq) => (
              <View key={eq} style={s.equipBadge}>
                <Text style={s.equipBadgeText}>{eq}</Text>
              </View>
            ))}
          </View>
          </FadeTranslate>

          {/* Exercises List */}
          <View style={s.exercisesSection}>
            <FadeTranslate order={0.1}>
            <Text style={s.sectionTitle}>Exercises</Text>
            </FadeTranslate>
            {routine.exercises.map((ex, i) => (
              <FadeTranslate key={i} delay={150 + (i * 100)} order={0.2} direction="y" translateYFrom={20}>
              <TouchableOpacity
                style={s.exerciseItem}
                activeOpacity={0.7}
                onPress={() => handleExercisePress(ex)}
              >
                <View style={s.exerciseImageWrap}>
                  {ex.gifUrl ? (
                    <Image source={{ uri: ex.gifUrl }} style={s.exerciseImage} resizeMode="contain" />
                  ) : (
                    <Ionicons name="image-outline" size={24} color={D.muted} />
                  )}
                </View>
                <View style={s.exerciseInfo}>
                  <Text style={s.exerciseName} numberOfLines={2}>{ex.name}</Text>
                  <Text style={s.exerciseDetails}>
                    {ex.sets} Sets • {ex.reps} Reps
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={D.muted} />
              </TouchableOpacity>
              </FadeTranslate>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Start Workout Button Footer */}
      <View style={[s.footer, { paddingBottom: insets.bottom || 24 }]}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "#000"]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <FadeTranslate order={0.4} delay={500} translateYFrom={40} style={{ width: '100%' }}>
          <TouchableOpacity style={s.startBtn} activeOpacity={0.8} onPress={handleStartRoutine}>
            <Text style={s.startBtnText}>Start Workout</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8, marginTop: 2 }} />
          </TouchableOpacity>
        </FadeTranslate>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { },
  
  heroWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 0.85,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroEmoji: {
    fontSize: 90,
    marginBottom: 40, 
  },

  contentWrapper: {
    backgroundColor: D.bg,
    minHeight: 600,
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  contentHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#333",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.black,
    color: D.text,
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontFamily: theme.medium,
    color: D.sub,
    marginBottom: 24,
    lineHeight: 22,
  },

  // Top Stats
  topStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  topStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topStatText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: D.sub,
  },
  topStatDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: D.muted,
    marginHorizontal: 10,
  },

  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 32,
  },
  muscleBadge: {
    backgroundColor: "rgba(79,195,247,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.3)",
  },
  muscleBadgeText: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: "#4FC3F7",
  },
  equipBadge: {
    backgroundColor: "rgba(255,183,77,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,183,77,0.3)",
  },
  equipBadgeText: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: "#FFB74D",
  },

  // Exercises
  exercisesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.bold,
    color: D.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: D.cardAlt,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  exerciseImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  exerciseImage: {
    width: "80%",
    height: "80%",
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: "center",
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: D.text,
    marginBottom: 4,
    textTransform: "capitalize",
    paddingRight: 10,
  },
  exerciseDetails: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: D.sub,
  },

  // Footer Button
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  startBtn: {
    backgroundColor: D.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 56,
    borderRadius: 28,
  },
  startBtnText: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: "#000",
  },
});
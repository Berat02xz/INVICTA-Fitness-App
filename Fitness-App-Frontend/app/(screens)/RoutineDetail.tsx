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
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Image Component (rounded bottom) */}
        <View style={[s.headerWrap]}>
          <LinearGradient
            colors={routine.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={s.headerGradient}
          />
          {/* Back btn absolute in header */}
          <TouchableOpacity
            style={[s.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={s.heroEmoji}>{routine.emoji}</Text>

          <View style={s.headerOverlayContent}>
            <FadeTranslate order={0} direction="y" translateYFrom={15}>
              <Text style={s.headerTitle}>{routine.name}</Text>
              <View style={s.tagsRowHeader}>
                {routine.targetMuscles.map((m) => (
                  <View key={m} style={s.whiteTag}>
                    <Text style={s.whiteTagText}>{m}</Text>
                  </View>
                ))}
                {routine.equipment.slice(0,1).map((eq) => (
                  <View key={eq} style={s.whiteTag}>
                    <Text style={s.whiteTagText}>{eq}</Text>
                  </View>
                ))}
              </View>
            </FadeTranslate>
          </View>
        </View>

        {/* Content Wrapper */}
        <View style={s.contentWrapper}>
          <FadeTranslate order={0.1} delay={100} direction="y" translateYFrom={15}>
            <Text style={s.sectionSubtitle}>ABOUT</Text>
            <Text style={s.description}>{routine.description}</Text>

            {/* Stats Box (unified dark card) */}
            <View style={s.statsCard}>
              <View style={s.statCol}>
                <View style={s.statIconWrap}>
                   <Ionicons name="stats-chart" size={14} color="#AAFB05" />
                </View>
                <View>
                  <Text style={s.statLabel}>Difficulty</Text>
                  <Text style={s.statVal}>{routine.difficulty}</Text>
                </View>
              </View>

              <View style={s.statDivider} />

              <View style={s.statCol}>
                <View style={s.statIconWrap}>
                   <Ionicons name="star" size={14} color="#AAFB05" />
                </View>
                <View>
                  <Text style={s.statLabel}>Duration</Text>
                  <Text style={s.statVal}>{routine.duration}</Text>
                </View>
              </View>

              <View style={s.statDivider} />

              <View style={s.statCol}>
                <View style={s.statIconWrap}>
                   <Ionicons name="person-circle" size={16} color="#AAFB05" />
                </View>
                <View>
                  <Text style={s.statLabel}>Exercises</Text>
                  <Text style={s.statVal}>{routine.exercises.length}</Text>
                </View>
              </View>
            </View>
          </FadeTranslate>

          {/* Exercises List — WorkoutPlayer style */}
          <View style={s.exercisesSection}>
            {routine.exercises.map((ex, i) => {
              const setsLabel = ex.sets ? `${ex.sets} sets` : null;
              const repsLabel = ex.reps ? `${ex.reps} reps` : null;
              const metaLabel = [setsLabel, repsLabel].filter(Boolean).join(" · ");
              return (
                <FadeTranslate key={i} delay={150 + (i * 80)} order={0.2} direction="y" translateYFrom={20}>
                  <TouchableOpacity
                    style={s.exerciseCard}
                    activeOpacity={0.75}
                    onPress={() => handleExercisePress(ex)}
                  >
                    {/* Thumbnail */}
                    <View style={s.exerciseThumb}>
                      {ex.gifUrl ? (
                        <Image source={{ uri: ex.gifUrl }} style={s.exerciseThumbImg} />
                      ) : (
                        <Ionicons name="barbell-outline" size={28} color="#333" />
                      )}
                    </View>
                    {/* Info */}
                    <View style={s.exerciseInfo}>
                      <Text style={s.exerciseName} numberOfLines={1}>{ex.name}</Text>
                      {metaLabel ? (
                        <Text style={s.exerciseMeta}>{metaLabel}</Text>
                      ) : null}
                    </View>
                    {/* Chevron */}
                    <View style={s.exerciseChevron}>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                    </View>
                  </TouchableOpacity>
                </FadeTranslate>
              );
            })}
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
  container: { flex: 1, backgroundColor: "#000000" },
  backBtn: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { },
  
  headerWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 1.15,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroEmoji: {
    fontSize: 100,
    marginBottom: 60, 
  },
  headerOverlayContent: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    zIndex: 2,
  },
  headerTitle: {
    fontFamily: theme.black,
    fontSize: 32,
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  tagsRowHeader: {
    flexDirection: "row",
    gap: 8,
  },
  whiteTag: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  whiteTagText: {
    color: "#000000",
    fontFamily: theme.bold,
    fontSize: 12,
  },

  contentWrapper: {
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingTop: 32,
    minHeight: 500,
  },
  sectionSubtitle: {
    fontFamily: theme.bold,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 26,
    marginBottom: 24,
  },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "#161616",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(170,251,5,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 3,
  },
  statVal: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: "#FFFFFF",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 8,
  },

  exercisesSection: {
    gap: 12,
    marginBottom: 24,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252528",
    padding: 8,
    borderRadius: 20,
    minHeight: 80,
  },
  exerciseThumb: {
    width: 70,
    height: 70,
    backgroundColor: "#111",
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseThumbImg: {
    width: "100%" as any,
    height: "100%" as any,
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: "center",
  },
  exerciseName: {
    color: "#FFFFFF",
    fontFamily: theme.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  exerciseMeta: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: theme.medium,
    fontSize: 14,
  },
  exerciseChevron: {
    paddingHorizontal: 6,
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
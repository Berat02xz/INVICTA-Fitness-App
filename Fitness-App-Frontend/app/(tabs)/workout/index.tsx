import React, { useState, useMemo, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  StyleSheet
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import FadeTranslate from "@/components/ui/FadeTranslate";
import {
  ROUTINES,
  type WorkoutRoutine,
} from "@/constants/workoutRoutines";
import { ExerciseApi, type ExerciseInfo } from "@/api/ExerciseApi";

const { width: SCREEN_W } = Dimensions.get("window");
const ROUTINE_EQUIPMENT_PILLS = ["Barbell", "Dumbbell", "Gym mat", "Pull-up bar", "Bench"];

const titleCase = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export default function Workout() {
  const insets = useSafeAreaInsets();
  
  const [selectedRoutineFilter, setSelectedRoutineFilter] = useState("All");
  const [baseRoutines, setBaseRoutines] = useState(ROUTINES);
  
  const [exercisePool, setExercisePool] = useState<ExerciseInfo[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const apiExercises = useMemo(() => {
    return exercisePool.slice(0, 15);
  }, [exercisePool]);

  useEffect(() => {
    let cancelled = false;
    setExercisesLoading(true);

    const unsubProgress = ExerciseApi.onProgress((msg) => {
      if (!cancelled) setLoadingMessage(msg);
    });

    const unsubExercises = ExerciseApi.onExercises((exercises) => {
      if (!cancelled) setExercisePool(exercises);
    });

    ExerciseApi.getAllExercises().then(() => {
      if (!cancelled) setExercisesLoading(false);
    });
    setBaseRoutines([...ROUTINES].sort(() => Math.random() - 0.5));
    return () => {
      cancelled = true;
      unsubProgress();
      unsubExercises();
    };
  }, []);

  const handleRoutinePress = (routine: WorkoutRoutine) => {
    router.push({
      pathname: "/(screens)/RoutineDetail",
      params: { routineId: routine.id },
    });
  };

  const parseDuration = (d: string) => parseInt(d.replace(/[^0-9]/g, ""), 10) || 0;

  const routineFilterPills = [
    "All",
    "Beginner", "Intermediate", "Advanced",
    "< 30 min", "45+ min",
    ...ROUTINE_EQUIPMENT_PILLS,
  ];

  const filteredRoutines = useMemo(() => {
    if (selectedRoutineFilter === "All") return baseRoutines;
    return baseRoutines.filter((r) => {
      if (["Beginner", "Intermediate", "Advanced"].includes(selectedRoutineFilter)) {
        return r.difficulty === selectedRoutineFilter;
      }
      const mins = parseDuration(r.duration);
      if (selectedRoutineFilter === "< 30 min") return mins < 30;
      if (selectedRoutineFilter === "45+ min") return mins >= 45;
      return r.equipment.some(
        (eq) => eq.toLowerCase() === selectedRoutineFilter.toLowerCase()
      );
    });
  }, [selectedRoutineFilter, baseRoutines]);

  const totalCoins = 200;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      
      <Image
        source={require("@/assets/icons/backgrounds/TopBackground.png")}
        style={s.topBgImage}
        resizeMode="cover"
      />
      <LinearGradient colors={["transparent", "#000"]} style={s.topBgGradient} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FadeTranslate order={0} direction="y" translateYFrom={-24} delay={0}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <Text style={s.quoteTitle}>BUILT{"\n"}DIFFERENT</Text>
              <Text style={s.quoteSub}>Train like you mean it</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity 
                style={s.coinBadge} 
                activeOpacity={0.8}
                onPress={() => router.push("/(screens)/Roadmap")}
              >
                <View style={s.coinIconWrap}>
                   <Text style={{ fontSize: 10 }}>💰</Text>
                </View>
                <Text style={s.coinText}>{totalCoins}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.searchBarWrap}>
            <TouchableOpacity activeOpacity={0.8} style={s.searchBar} onPress={() => router.push("/(screens)/ExerciseList")}>
              <Ionicons name="search" size={18} color="#888" />
              <Text style={s.searchText}>Search workout</Text>
            </TouchableOpacity>
          </View>
        </FadeTranslate>

        <FadeTranslate order={0} delay={400} direction="y" translateYFrom={16}>
          <Text style={s.sectionTitle}>Workout Routines</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipScroll}
          >
            {routineFilterPills.map((pill, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => setSelectedRoutineFilter(pill)}
                style={[
                  s.chip,
                  selectedRoutineFilter === pill && s.chipActive,
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    selectedRoutineFilter === pill && s.chipTextActive,
                  ]}
                >
                  {pill}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.routinesWheelRow}
            snapToInterval={SCREEN_W * 0.72 + 16}
            decelerationRate="fast"
          >
            {filteredRoutines.map((routine, idx) => {
              const cardBg = routine.gradient || ["#2A2A2A", "#000000"];
              let isLight = false;
              try {
                const hex = cardBg[0].replace("#", "");
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 2), 16);
                const b = parseInt(hex.substring(4, 2), 16);
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                isLight = yiq >= 150; // Threshold for dark text
              } catch (e) {}

              return (
                <FadeTranslate
                  key={`routine-${routine.id}`}
                  direction="x"
                  translateXFrom={60}
                  delay={100}
                  order={idx * 0.1}
                >
                  <TouchableOpacity
                    style={[s.routineCardLarge, { overflow: "hidden" }]}
                    activeOpacity={0.9}
                    onPress={() => handleRoutinePress(routine)}
                  >
                    <LinearGradient
                      colors={cardBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={s.routineLargeInner}>
                      <View style={s.routineTopBadges}>
                        <View style={s.badgePill}>
                          <Text style={s.badgeText}>{routine.difficulty}</Text>
                        </View>
                        <View style={s.badgePill}>
                          <Text style={s.badgeText}>{routine.duration}</Text>
                        </View>
                      </View>
                      <View style={s.routineMainContent}>
                        <Text
                          style={[
                            s.routineLargeTitle,
                            isLight && { color: "#000" },
                          ]}
                        >
                          {routine.name}
                        </Text>
                        <Text
                          style={[
                            s.routineLargeSub,
                            isLight && { color: "rgba(0,0,0,0.8)" },
                          ]}
                        >
                          {routine.exercises.length} Exercises • {routine.equipment.join(", ")}
                        </Text>
                      </View>
                      <View style={s.routinePlayWrap}>
                        <View
                          style={[
                            s.routinePlayBtn,
                            isLight && { backgroundColor: "#fff" },
                          ]}
                        >
                          <Text
                            style={[
                              s.routinePlayText,
                              isLight && { color: "#000" },
                            ]}
                          >
                            Start Routine
                          </Text>
                          <Ionicons
                            name="play"
                            size={16}
                            color={isLight ? "#000" : "#fff"}
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </FadeTranslate>
              );
            })}
          </ScrollView>
        </FadeTranslate>

        <FadeTranslate order={0} delay={600} direction="y" translateYFrom={-16}>
          <View style={s.sectionHeaderRowInline}>
            <Text style={s.sectionTitleInline}>Featured Workouts</Text>
            <TouchableOpacity onPress={() => router.push("/(screens)/ExerciseList")}>
               <Text style={s.seeAllText}>View more</Text>
            </TouchableOpacity>
          </View>

          {exercisesLoading && apiExercises.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40, gap: 12 }}>
              <ActivityIndicator color="#AAFB05" />
              {loadingMessage ? (
                <Text style={{ color: "#888", fontSize: 14 }}>{loadingMessage}</Text>
              ) : null}
            </View>
          ) : apiExercises.length === 0 ? (
            <Text style={s.emptyText}>No exercises found.</Text>
          ) : (
            <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.albumCoverScroll}
            >
               {apiExercises.map((ex, exIdx) => {
                 const bodyPart = ex.bodyParts[0] ?? "";
                 return (
                   <FadeTranslate key={ex.exerciseId} direction="x" translateXFrom={60} delay={500} order={exIdx * 0.12}>
                   <TouchableOpacity
                     style={s.albumCard}
                     activeOpacity={0.8}
                     onPress={() => router.push({ pathname: "/(screens)/ExerciseDetail", params: { exerciseId: ex.exerciseId } })}
                   >
                     <View style={s.albumArtWrap}>
                       {ex.gifUrl ? (
                         <Image source={{uri: ex.gifUrl}} style={s.albumArt} />
                         ) : (
                           <Ionicons name="barbell" size={40} color="#333" />
                         )}
                      </View>
                      <Text style={s.albumTitle} numberOfLines={1}>{titleCase(ex.name)}</Text>
                      <Text style={s.albumSub} numberOfLines={1}>{ex.equipments[0] ?? bodyPart}</Text>
                   </TouchableOpacity>
                   </FadeTranslate>
                 );
               })}
            </ScrollView>
            </>
          )}
        </FadeTranslate>



      </ScrollView>
    </View>
  );
}

const D = {
  bg: "#000000",
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.15)",
  text: "#FFFFFF",
  sub: "#666666",
  muted: "#333333",
  card: "#121212",
  cardAlt: "#1C1C1E",
  border: "#2A2A2A",
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  topBgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    opacity: 0.4,
  },
  topBgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.get("window").height,
  },
  scroll: { flex: 1 },
  scrollContent: {},
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  quoteTitle: {
    color: "#fff",
    fontFamily: theme.bold,
    fontSize: 28,
    lineHeight: 34,
    textTransform: "uppercase",
  },
  quoteSub: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: theme.medium,
    fontSize: 14,
    marginTop: 6,
  },
  headerRight: { justifyContent: "center" },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coinIconWrap: {
    width: 20,
    height: 20,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: { color: "#000", fontFamily: theme.bold, fontSize: 14 },
  searchBarWrap: { paddingHorizontal: 20, marginBottom: 28 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchText: {
    color: "#888",
    fontFamily: theme.medium,
    fontSize: 15,
    marginLeft: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontFamily: theme.bold,
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chipScroll: { paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  chip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: D.primary },
  chipText: { color: "#fff", fontFamily: theme.medium, fontSize: 14 },
  chipTextActive: { color: "#000", fontFamily: theme.bold },
  emptyText: {
    color: D.sub,
    fontFamily: theme.medium,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  routinesWheelRow: { paddingHorizontal: 20, paddingBottom: 32 },
  routineCardLarge: {
    width: SCREEN_W * 0.72,
    height: 380,
    marginRight: 16,
    borderRadius: 32,
    overflow: "hidden",
  },
  routineLargeInner: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  routineTopBadges: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badgePill: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: "#fff",
    fontFamily: theme.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  routineMainContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  routineLargeTitle: {
    color: "#fff",
    fontFamily: theme.bold,
    fontSize: 34,
    lineHeight: 38,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  routineLargeSub: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: theme.medium,
    fontSize: 15,
  },
  routinePlayWrap: { alignItems: "flex-start" },
  routinePlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  routinePlayText: { color: "#fff", fontFamily: theme.bold, fontSize: 16 },
  sectionHeaderRowInline: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingRight: 24,
    marginBottom: 16,
  },
  sectionTitleInline: { color: "#fff", fontFamily: theme.bold, fontSize: 18 },
  seeAllText: {
    color: D.primary,
    fontFamily: theme.medium,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  albumCoverScroll: { paddingHorizontal: 20, paddingBottom: 20 },
  albumCard: { width: 140, marginRight: 16 },
  albumArtWrap: {
    width: 140,
    height: 140,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  albumArt: { width: "100%", height: "100%", backgroundColor: "#1C1C1E" },
  albumTitle: { color: "#fff", fontFamily: theme.bold, fontSize: 14, marginBottom: 2 },
  albumSub: { color: D.sub, fontFamily: theme.medium, fontSize: 13 },
});

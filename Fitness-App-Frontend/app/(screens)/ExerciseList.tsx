import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ROUTINES, RoutineExercise } from "../../constants/workoutRoutines";
import { theme } from "../../constants/theme";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { ExerciseApi, ExerciseInfo } from "../../api/ExerciseApi";

const { width: SCREEN_W } = Dimensions.get("window");

const D = {
  bg: "#000000",
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.15)",
  card: "#121212",
  text: "#FFFFFF",
  sub: "#666666",
  muted: "#333333",
  border: "#2A2A2E",
};

function getImageUri(gifUrl: string | null) {
  return gifUrl || null;
}

export default function ExerciseList() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [apiExercises, setApiExercises] = useState<ExerciseInfo[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [muscles, setMuscles] = useState<string[]>(["All"]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local exercises from routines (default "All" view)
  const localExercises = useMemo(() => {
    const exerciseMap = new Map<string, RoutineExercise>();
    ROUTINES.forEach((routine) => {
      routine.exercises.forEach((exercise) => {
        if (!exerciseMap.has(exercise.exerciseId)) {
          exerciseMap.set(exercise.exerciseId, exercise);
        }
      });
    });
    return Array.from(exerciseMap.values());
  }, []);

  // Fetch muscle list from API on mount
  useEffect(() => {
    (async () => {
      const apiMuscles = await ExerciseApi.getMuscles();
      if (apiMuscles.length > 0) {
        setMuscles(["All", ...apiMuscles.sort()]);
      } else {
        // Fallback to local categories
        const categories = new Set(localExercises.map((e) => e.category));
        setMuscles(["All", ...Array.from(categories).sort()]);
      }
    })();
  }, [localExercises]);

  // Fetch exercises from API when muscle filter or search changes
  const fetchExercises = useCallback(async (muscle: string, searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    // If "All" and no search, use local exercises
    if (muscle === "All" && !trimmedQuery) {
      setApiExercises([]);
      setApiTotal(0);
      return;
    }

    setLoading(true);
    try {
      if (trimmedQuery) {
        // Text search (API searches across name, muscles, equipment, body parts)
        const { exercises, total } = await ExerciseApi.searchExercises(trimmedQuery, 50);
        // If a muscle is also selected, filter the search results by that muscle
        if (muscle !== "All") {
          const filtered = exercises.filter((e) =>
            e.targetMuscles.some((m) => m.toLowerCase() === muscle.toLowerCase())
          );
          setApiExercises(filtered);
          setApiTotal(filtered.length);
        } else {
          setApiExercises(exercises);
          setApiTotal(total);
        }
      } else {
        // Muscle filter only
        const { exercises, total } = await ExerciseApi.getExercisesByMuscle(muscle, 50);
        setApiExercises(exercises);
        setApiTotal(total);
      }
    } catch {
      setApiExercises([]);
      setApiTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch when muscle changes
  useEffect(() => {
    fetchExercises(selectedMuscle, query);
  }, [selectedMuscle]);

  // Debounced search
  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchExercises(selectedMuscle, text);
    }, 400);
  }, [selectedMuscle, fetchExercises]);

  // Determine which exercises to show
  const isUsingApi = selectedMuscle !== "All" || query.trim().length > 0;

  const results = useMemo(() => {
    if (isUsingApi) return apiExercises;
    // Local filtering for "All" with no search
    return localExercises;
  }, [isUsingApi, apiExercises, localExercises]);

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.title}>Exercises</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeTranslate order={0}>
            <View style={s.headerRow}>
              <Text style={s.heroTitle}>Find Exercises</Text>
              <TouchableOpacity
                style={s.savedPill}
                activeOpacity={0.8}
                onPress={() => router.push("/(screens)/SavedExercises")}
              >
                <Ionicons name="heart" size={16} color="#ff4000" />
                <Text style={s.savedPillText}>Saved</Text>
              </TouchableOpacity>
            </View>

            <View style={s.searchRow}>
              <View style={s.searchBox}>
                <Ionicons name="search" size={20} color={D.sub} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search over 1000+ exercises..."
                  placeholderTextColor={D.sub}
                  value={query}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                  autoCorrect={false}
                  selectionColor={D.primary}
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => { setQuery(""); fetchExercises(selectedMuscle, ""); }}
                    style={s.clearBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color={D.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </FadeTranslate>

          <FadeTranslate order={0.1}>
            <View style={s.muscleSectionHeader}>
              <Text style={s.sectionLabel}>Muscles</Text>
              {selectedMuscle !== "All" && (
                <TouchableOpacity onPress={() => setSelectedMuscle("All")} activeOpacity={0.7}>
                  <Text style={s.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.muscleRow}
            >
              {muscles.map((muscle) => {
                const active = selectedMuscle === muscle;

                return (
                  <TouchableOpacity
                    key={muscle}
                    style={[s.muscleChip, active && s.muscleChipActive]}
                    onPress={() => setSelectedMuscle(active ? "All" : muscle)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.muscleText, active && s.muscleTextActive]}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </FadeTranslate>

          <View style={s.resultsContainer}>
            {loading ? (
              <View style={s.emptyState}>
                <ActivityIndicator size="large" color={D.primary} />
                <Text style={[s.emptyText, { marginTop: 16 }]}>Loading exercises...</Text>
              </View>
            ) : results.length === 0 ? (
              <FadeTranslate order={0.2}>
                <View style={s.emptyState}>
                  <View style={s.emptyIconWrap}>
                    <Ionicons name="barbell-outline" size={40} color={D.sub} />
                  </View>
                  <Text style={s.emptyTitle}>No Exercises Found</Text>
                  <Text style={s.emptyText}>
                    Try searching for something else or changing the filter.
                  </Text>
                </View>
              </FadeTranslate>
            ) : (
              <FadeTranslate order={0.2}>
                <View style={s.resultsHeader}>
                  <Text style={s.sectionLabel}>Results</Text>
                  <Text style={s.resultsCount}>
                    {isUsingApi && apiTotal > results.length
                      ? `${results.length} of ${apiTotal}`
                      : results.length}
                  </Text>
                </View>

                <View style={s.resultsGrid}>
                  {results.map((exercise, index) => {
                    const isApi = isUsingApi && 'targetMuscles' in exercise;
                    const apiEx = exercise as ExerciseInfo;
                    const localEx = exercise as RoutineExercise;

                    const imageUri = getImageUri(exercise.gifUrl);
                    const category = isApi
                      ? (apiEx.targetMuscles[0] ?? apiEx.bodyParts[0] ?? "")
                      : localEx.category;

                    return (
                      <FadeTranslate
                        key={`${exercise.exerciseId}-${index}`}
                        order={0.3 + Math.min(index, 10) * 0.05}
                      >
                        <TouchableOpacity
                          style={s.resultCard}
                          activeOpacity={0.9}
                          onPress={() =>
                            router.push({
                              pathname: "/(screens)/ExerciseDetail",
                              params: {
                                exerciseId: exercise.exerciseId,
                                name: exercise.name,
                                sets: isApi ? "3" : String(localEx.sets),
                                reps: isApi ? "12" : localEx.reps,
                                restSeconds: isApi ? "60" : String(localEx.restSeconds),
                                category,
                                gifUrl: exercise.gifUrl ?? "",
                              },
                            })
                          }
                        >
                          <View style={s.resultImageWrap}>
                            {imageUri ? (
                              <Image
                                source={{ uri: imageUri }}
                                style={s.resultImage}
                                resizeMode="contain"
                              />
                            ) : (
                              <Ionicons name="barbell" size={40} color="rgba(0,0,0,0.2)" />
                            )}
                          </View>
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"]}
                            style={s.resultGradient}
                          />
                          <View style={s.resultInfo}>
                            <Text style={s.resultName} numberOfLines={2}>
                              {exercise.name}
                            </Text>
                            <View style={s.categoryPill}>
                              <Text style={s.categoryText}>{category}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </FadeTranslate>
                    );
                  })}
                </View>
              </FadeTranslate>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: D.text,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: theme.black,
    color: D.text,
  },
  savedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,64,0,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,64,0,0.2)",
  },
  savedPillText: {
    color: "#ff4000",
    fontFamily: theme.bold,
    fontSize: 14,
  },
  searchRow: { paddingHorizontal: 20, marginBottom: 30 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161616",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    borderWidth: 1,
    borderColor: D.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.medium,
    color: D.text,
    padding: 0,
  },
  clearBtn: { padding: 4 },
  muscleSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: D.text,
  },
  clearFilterText: {
    fontSize: 14,
    fontFamily: theme.semibold,
    color: D.primary,
  },
  muscleRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  muscleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  muscleChipActive: {
    backgroundColor: D.primaryDim,
    borderColor: D.primary,
  },
  muscleText: {
    fontSize: 14,
    fontFamily: theme.semibold,
    color: D.text,
  },
  muscleTextActive: { color: D.primary },
  resultsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  resultsCount: {
    backgroundColor: "#222",
    color: D.text,
    fontSize: 12,
    fontFamily: theme.bold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  resultCard: {
    width: (SCREEN_W - 56) / 2,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: D.card,
    borderWidth: 1,
    borderColor: D.border,
  },
  resultImageWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  resultGradient: {
    position: "absolute",
    top: "20%",
    bottom: 0,
    left: 0,
    right: 0,
  },
  resultInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingTop: 30,
  },
  resultName: {
    fontSize: 14,
    fontFamily: theme.bold,
    color: D.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: theme.bold,
    color: "#FFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.bold,
    color: D.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: D.sub,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});

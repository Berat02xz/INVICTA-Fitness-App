import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { theme } from "../../constants/theme";
import FadeTranslate from "@/components/ui/FadeTranslate";
import { ExerciseApi, ExerciseInfo } from "../../api/ExerciseApi";
import { LikedExercise } from "@/models/LikedExercise";
import database from "@/database/database";
import { useFocusEffect } from "expo-router";

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

const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

/** Curated muscle filter pills — label shown in UI, matches are the API values to include */
const MUSCLE_FILTERS: { label: string; matches: string[] }[] = [
  { label: "All",       matches: [] },
  { label: "Saved",     matches: [] },
  { label: "Abs",       matches: ["abs", "abdominals", "lower abs", "core", "obliques"] },
  { label: "Chest",     matches: ["chest", "pectorals", "upper chest"] },
  { label: "Back",      matches: ["back", "lats", "latissimus dorsi", "upper back", "rhomboids", "traps", "trapezius"] },
  { label: "Biceps",    matches: ["biceps", "brachialis"] },
  { label: "Triceps",   matches: ["triceps"] },
  { label: "Shoulders", matches: ["shoulders", "deltoids", "delts", "rear deltoids"] },
  { label: "Legs",      matches: ["quadriceps", "quads", "hamstrings", "adductors", "abductors", "inner thighs", "hip flexors"] },
  { label: "Glutes",    matches: ["glutes"] },
  { label: "Calves",    matches: ["calves", "soleus", "shins"] },
  { label: "Forearms",  matches: ["forearms", "wrist extensors", "wrist flexors", "grip muscles"] },
  { label: "Cardio",    matches: ["cardiovascular system", "cardio"] },
];

export default function ExerciseList() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [savedExerciseIds, setSavedExerciseIds] = useState<Set<string>>(new Set());

  // Full exercise pool — fetched once and cached (~1500 exercises)
  const [allPool, setAllPool] = useState<ExerciseInfo[]>([]);

  // Fetch full exercise pool in background (cursor-paginated, cached after first load)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const unsubProgress = ExerciseApi.onProgress((msg) => {
      if (!cancelled) setLoadingMessage(msg);
    });

    const unsubExercises = ExerciseApi.onExercises((exercises) => {
      if (!cancelled) setAllPool(exercises);
    });

    ExerciseApi.getAllExercises().then(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubProgress();
      unsubExercises();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh saved exercises when navigating back here
      LikedExercise.getAll(database).then((liked) => {
         setSavedExerciseIds(new Set(liked.map((ex) => ex.exerciseId)));
      });
    }, [])
  );

  // Filter client-side from the full cached pool
  const results = useMemo(() => {
    let pool = allPool;

    if (selectedMuscle === "Saved") {
      pool = pool.filter((ex) => savedExerciseIds.has(ex.exerciseId));
    } else if (selectedMuscle !== "All") {
      const filter = MUSCLE_FILTERS.find((f) => f.label === selectedMuscle);
      if (filter) {
        pool = pool.filter((ex) =>
          ex.targetMuscles.some((t) => filter.matches.includes(t.toLowerCase())) ||
          ex.secondaryMuscles?.some((t) => filter.matches.includes(t.toLowerCase())) ||
          ex.bodyParts.some((b) => filter.matches.includes(b.toLowerCase()))
        );
      }
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      pool = pool.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.targetMuscles.some((t) => t.toLowerCase().includes(q)) ||
          ex.equipments.some((e) => e.toLowerCase().includes(q)) ||
          ex.bodyParts.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Deduplicate by exerciseId
    const seen = new Set<string>();
    return pool.filter((ex) => {
      if (seen.has(ex.exerciseId)) return false;
      seen.add(ex.exerciseId);
      return true;
    });
  }, [allPool, selectedMuscle, query, savedExerciseIds]);

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

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
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeTranslate order={0} direction="y" translateYFrom={-24}>
            <View style={s.searchRow}>
              <View style={s.searchBox}>
                <Ionicons name="search" size={20} color={D.sub} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search your program..."
                  placeholderTextColor={D.sub}
                  value={query}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                  autoCorrect={false}
                  selectionColor={D.primary}
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setQuery("")}
                    style={s.clearBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color={D.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </FadeTranslate>

          <FadeTranslate order={0} delay={100} direction="x" translateXFrom={60}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.muscleRow}
            >
              {MUSCLE_FILTERS.map(({ label }) => {
                const active = selectedMuscle === label;
                let iconName: keyof typeof Ionicons.glyphMap | undefined = undefined;
                let textColor = active ? "#000" : "#DEDEDE";

                if (label === "Saved") {
                   iconName = active ? "heart" : "heart-outline";
                   textColor = active ? "#ff4000" : "#DEDEDE";
                }

                return (
                  <React.Fragment key={label}>
                    <TouchableOpacity
                      style={[
                        s.muscleChip, 
                        active ? s.muscleChipActive : null, 
                        label === "Saved" && active && { backgroundColor: "rgba(255, 64, 0, 0.15)" }
                      ]}
                      onPress={() => setSelectedMuscle(active ? "All" : label)}
                      activeOpacity={0.7}
                    >
                      {iconName && <Ionicons name={iconName} size={16} color={textColor} />}
                      <Text style={[s.muscleText, { color: textColor }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                    {label === "Saved" && <View style={s.chipDivider} />}
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </FadeTranslate>

          <View style={s.resultsContainer}>
            {loading && results.length === 0 ? (
              <View style={s.emptyState}>
                <ActivityIndicator size="large" color={D.primary} />
                <Text style={[s.emptyText, { marginTop: 16 }]}>{loadingMessage || "Loading exercises..."}</Text>
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
              <>
                <FadeTranslate order={0} delay={200} direction="y" translateYFrom={-16}>
                  <View style={s.resultsHeader}>
                    <Text style={s.sectionLabel}>{results.length} Exercise{results.length !== 1 ? 's' : ''}</Text>
                  </View>
                </FadeTranslate>

                <View style={s.resultsList}>
                  {results.slice(0, Math.min(results.length, 50)).map((exercise, index) => {
                    const imageUri = getImageUri(exercise.gifUrl);
                    const category = (exercise as ExerciseInfo).targetMuscles?.[0]
                      ?? (exercise as ExerciseInfo).bodyParts?.[0]
                      ?? "Strength"; // fallback category
                    const equipment = exercise.equipments?.[0] ? capitalize(exercise.equipments[0]) : "Bodyweight";

                    return (
                      <FadeTranslate
                        key={`${exercise.exerciseId}-${index}`}
                        direction="y"
                        translateYFrom={40}
                        delay={100}
                        order={Math.min(index, 10) * 0.05}
                      >
                        <TouchableOpacity
                          style={s.exerciseListItem}
                          activeOpacity={0.7}
                          onPress={() =>
                            router.push({
                              pathname: "/(screens)/ExerciseDetail",
                              params: {
                                exerciseId: exercise.exerciseId,
                                name: exercise.name,
                                sets: "3",
                                reps: "12",
                                restSeconds: "60",
                                category,
                                gifUrl: exercise.gifUrl ?? "",
                              },
                            })
                          }
                        >
                          {/* Thumbnail */}
                          <View style={s.listItemImageWrap}>
                            {imageUri ? (
                              <Image
                                source={{ uri: imageUri }}
                                style={s.listItemImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <Ionicons name="barbell-outline" size={30} color="gray" style={{ alignSelf: 'center', marginTop: 30 }} />
                            )}
                          </View>
                          
                          {/* Info Column */}
                          <View style={s.listItemInfo}>
                            <Text style={s.listItemName} numberOfLines={2}>
                              {capitalize(exercise.name)}
                            </Text>

                            <View style={s.listItemPillsRow}>
                               <View style={s.infoPill}>
                                 <Text style={s.infoPillText}>{capitalize(category)} Focus</Text>
                               </View>
                               <View style={s.infoPill}>
                                 <Ionicons name="barbell" size={11} color="rgba(255,255,255,0.4)" style={{marginRight: 4}} />
                                 <Text style={s.infoPillText}>{equipment}</Text>
                               </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </FadeTranslate>
                    );
                  })}
                  {results.length > 50 && (
                     <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: theme.medium, marginTop: 20 }}>
                        Showing first 50 results. Use search to refine.
                     </Text>
                  )}
                </View>
              </>
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
  scrollContent: { paddingTop: 16 },
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
  searchRow: { paddingHorizontal: 20, marginBottom: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
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
    fontSize: 15,
    fontFamily: theme.bold,
    color: "#FFFFFF",
    letterSpacing: 0.8,
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
    backgroundColor: "#2C2C2E",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  muscleChipActive: {
    backgroundColor: D.primary,
  },
  muscleText: {
    fontSize: 14,
    fontFamily: theme.semibold,
  },
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
  resultsList: {
    flexDirection: "column",
    gap: 16,
  },
  exerciseListItem: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#1C1C1E",
    padding: 12,
    borderRadius: 20,
    minHeight: 110,
  },
  listItemImageWrap: {
    width: 90,
    height: 90,
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
  },
  listItemImage: {
    width: "100%",
    height: "100%",
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
    paddingVertical: 4,
  },
  listItemName: {
    color: "#fff",
    fontFamily: theme.bold,
    fontSize: 20,
    flex: 1,
    lineHeight: 26,
    marginBottom: 8,
  },
  heartBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 8,
    borderRadius: 12,
  },
  chipDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
    marginHorizontal: 4,
  },
  listItemPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoPillText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: theme.semibold,
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { ExerciseApi, type ExerciseInfo } from "@/api/ExerciseApi";
import { LikedExercise } from "@/models/LikedExercise";
import database from "@/database/database";

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

export default function ExerciseDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    exerciseId: string;
    name: string;
    sets: string;
    reps: string;
    restSeconds: string;
    category: string;
    gifUrl: string;
  }>();

  const [exerciseInfo, setExerciseInfo] = useState<ExerciseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.exerciseId) { setLoading(false); return; }
    (async () => {
      try {
        const info = await ExerciseApi.getExerciseById(params.exerciseId);
        setExerciseInfo(info);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [params.exerciseId]);

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (params.exerciseId) {
      LikedExercise.isLiked(database, params.exerciseId).then(setIsLiked);
    }
  }, [params.exerciseId]);

  const handleToggleLike = async () => {
    if (!params.exerciseId) return;
    const liked = await LikedExercise.toggle(
      database,
      params.exerciseId,
      exerciseInfo?.name || params.name || "Exercise",
      exerciseInfo?.gifUrl || params.gifUrl || "",
      params.category || exerciseInfo?.bodyParts?.[0] || "",
    );
    setIsLiked(liked);
  };

  const imageUri = exerciseInfo?.gifUrl || params.gifUrl || null;
  const displayName = exerciseInfo?.name || params.name || "Exercise";

  const cleanStepText = (text: string) => {
    let cleaned = text.replace(/^step\s*[:.-]?\s*\d+\s*[:.-]?\s*/i, "").trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  };

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  return (
    <View style={s.container}>
      {/* Absolute Back button */}
      <TouchableOpacity
        style={[s.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={24} color={D.text} />
      </TouchableOpacity>

      {/* Like button */}
      <TouchableOpacity
        style={[s.likeBtn, { top: insets.top + 8 }]}
        onPress={handleToggleLike}
        activeOpacity={0.8}
      >
        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#ff4000" : D.text} />
      </TouchableOpacity>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Dynamic Header Image */}
        <View style={[s.heroWrap, { paddingTop: insets.top }]}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={s.heroImg}
              resizeMode="contain"
            />
          ) : (
            <View style={s.heroFallback}>
              <Ionicons name="barbell-outline" size={64} color={D.muted} />
            </View>
          )}
        </View>

        {/* Info Wrapper - Overlaps Image */}
        <View style={s.contentWrapper}>
          <View style={s.contentHandle} />

          {/* Title */}
          <Text style={s.title}>{capitalize(displayName)}</Text>

          {/* Stats row if from Routine */}
          {params.sets && (
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Ionicons name="layers-outline" size={20} color={D.primary} style={{marginBottom: 6}} />
                <Text style={s.statVal}>{params.sets}</Text>
                <Text style={s.statLabel}>Sets</Text>
              </View>
              <View style={s.statCard}>
                <Ionicons name="repeat-outline" size={20} color={D.primary} style={{marginBottom: 6}} />
                <Text style={s.statVal}>{params.reps}</Text>
                <Text style={s.statLabel}>Reps</Text>
              </View>
              <View style={s.statCard}>
                <Ionicons name="timer-outline" size={20} color={D.primary} style={{marginBottom: 6}} />
                <Text style={s.statVal}>{params.restSeconds}s</Text>
                <Text style={s.statLabel}>Rest</Text>
              </View>
            </View>
          )}

          {/* Tags */}
          <View style={s.tagsRow}>
            {(params.category || exerciseInfo?.bodyParts[0]) && (
              <View style={s.categoryBadge}>
                <Text style={s.categoryBadgeText}>{capitalize(params.category || exerciseInfo?.bodyParts[0] || "")}</Text>
              </View>
            )}
            {exerciseInfo?.targetMuscles.map((m) => (
              <View key={m} style={s.muscleBadge}>
                <Text style={s.muscleBadgeText}>{capitalize(m)}</Text>
              </View>
            ))}
            {exerciseInfo?.equipments.map((eq) => (
              <View key={eq} style={s.equipBadge}>
                <Text style={s.equipBadgeText}>{capitalize(eq)}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {loading ? (
            <ActivityIndicator color={D.primary} style={{ marginTop: 40 }} />
          ) : exerciseInfo?.instructions?.length ? (
            <View style={s.descSection}>
              <Text style={s.descTitle}>Execution Guide</Text>
              {exerciseInfo.instructions.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepLineContainer}>
                    <View style={s.stepNumberWrap}>
                      <Text style={s.stepNumber}>{i + 1}</Text>
                    </View>
                    {i !== exerciseInfo.instructions.length - 1 && (
                      <View style={s.stepLine} />
                    )}
                  </View>
                  <View style={s.stepTextContainer}>
                    <Text style={s.descText}>{cleanStepText(step)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
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
  likeBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero
  heroWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 1.05,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  heroImg: { width: "75%", height: "90%" },
  heroFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },

  // Content Wrapper
  contentWrapper: {
    backgroundColor: D.bg,
    minHeight: 500,
    marginTop: -30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
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
    fontSize: 28,
    fontFamily: theme.black,
    color: D.text,
    marginBottom: 24,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: D.cardAlt,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statVal: {
    fontSize: 20,
    fontFamily: theme.black,
    color: D.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.medium,
    color: D.sub,
    marginTop: 2,
  },

  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 32,
  },
  categoryBadge: {
    backgroundColor: D.primaryDim,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(170,251,5,0.3)",
  },
  categoryBadgeText: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: D.primary,
  },
  muscleBadge: {
    backgroundColor: "rgba(79,195,247,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,183,77,0.3)",
  },
  equipBadgeText: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: "#FFB74D",
  },

  // Description
  descSection: {
    marginTop: 8,
  },
  descTitle: {
    fontSize: 20,
    fontFamily: theme.bold,
    color: D.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepLineContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: D.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(170,251,5,0.4)',
    zIndex: 2,
  },
  stepNumber: {
    fontSize: 13,
    fontFamily: theme.black,
    color: D.primary,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: D.muted,
    marginVertical: 4,
  },
  stepTextContainer: {
    flex: 1,
    paddingBottom: 32,
    paddingTop: 4,
  },
  descText: {
    fontSize: 15,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
  },
});

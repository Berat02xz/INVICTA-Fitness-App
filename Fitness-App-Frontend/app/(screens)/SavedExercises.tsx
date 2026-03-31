import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "@/constants/theme";
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
  cardAlt: "#1C1C1E",
};

export default function SavedExercises() {
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<LikedExercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      LikedExercise.getAll(database).then(setExercises);
    }, [])
  );

  const handlePress = (ex: LikedExercise) => {
    router.push({
      pathname: "/(screens)/ExerciseDetail",
      params: {
        exerciseId: ex.exerciseId,
        name: ex.name,
        gifUrl: ex.gifUrl || "",
        category: ex.category || "",
      },
    });
  };

  const handleUnlike = async (ex: LikedExercise) => {
    await LikedExercise.toggle(database, ex.exerciseId, ex.name, ex.gifUrl, ex.category);
    setExercises((prev) => prev.filter((e) => e.exerciseId !== ex.exerciseId));
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={24} color={D.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Saved Exercises</Text>
        <View style={{ width: 44 }} />
      </View>

      {exercises.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="heart-outline" size={64} color={D.muted} />
          <Text style={s.emptyTitle}>No saved exercises yet</Text>
          <Text style={s.emptySub}>Like exercises during workouts or from the exercise viewer to save them here</Text>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {exercises.map((ex) => (
            <TouchableOpacity
              key={ex.id}
              style={s.exerciseItem}
              activeOpacity={0.7}
              onPress={() => handlePress(ex)}
            >
              <View style={s.exerciseImageWrap}>
                {ex.gifUrl ? (
                  <Image source={{ uri: ex.gifUrl }} style={s.exerciseImage} resizeMode="contain" />
                ) : (
                  <Ionicons name="barbell-outline" size={24} color={D.muted} />
                )}
              </View>
              <View style={s.exerciseInfo}>
                <Text style={s.exerciseName} numberOfLines={2}>{ex.name}</Text>
                {ex.category ? <Text style={s.exerciseCategory}>{ex.category}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleUnlike(ex)} style={s.unlikeBtn} activeOpacity={0.7}>
                <Ionicons name="heart" size={22} color="#ff4000" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: D.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.bold,
    color: D.text,
    letterSpacing: -0.3,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.bold,
    color: D.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: D.sub,
    textAlign: "center",
    lineHeight: 20,
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
    marginRight: 14,
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
    paddingRight: 8,
  },
  exerciseCategory: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: D.sub,
    textTransform: "capitalize",
  },
  unlikeBtn: {
    padding: 8,
  },
});
